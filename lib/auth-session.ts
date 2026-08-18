import { randomBytes, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sessionCookieName } from "@/lib/auth-cookie";
import { LOGIN_CODE_COOLDOWN_MS } from "@/lib/login-cooldown";

export { sessionCookieName };

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const SESSION_DAYS = 30;
export const SEEDED_ADMIN_EMAIL = "admin@malkiacademy.com";

export function requestMeta() {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  return {
    userAgent: h.get("user-agent"),
    ipAddress: forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
  };
}

export function generateLoginCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashLoginCode(code: string) {
  return bcrypt.hash(code, 10);
}

export async function loginCodesMatch(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

export async function issueLoginCode(
  email: string,
  opts?: { skipRateLimit?: boolean },
) {
  if (!opts?.skipRateLimit) {
    const latest = await prisma.verificationCode.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (latest && Date.now() - latest.createdAt.getTime() < LOGIN_CODE_COOLDOWN_MS) {
      const wait = Math.ceil(
        (LOGIN_CODE_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000,
      );
      return { ok: false as const, reason: "rate" as const, wait };
    }
  }

  await prisma.verificationCode.deleteMany({ where: { email } });

  const code = generateLoginCode();
  const codeHash = await hashLoginCode(code);
  await prisma.verificationCode.create({
    data: {
      email,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return { ok: true as const, code };
}

export async function consumeLoginCode(email: string, code: string) {
  const row = await prisma.verificationCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!row) return { ok: false as const, reason: "missing" as const };
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.verificationCode.delete({ where: { id: row.id } });
    return { ok: false as const, reason: "expired" as const };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await prisma.verificationCode.delete({ where: { id: row.id } });
    return { ok: false as const, reason: "locked" as const };
  }

  const match = await loginCodesMatch(code, row.codeHash);
  if (!match) {
    const attempts = row.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await prisma.verificationCode.delete({ where: { id: row.id } });
      return { ok: false as const, reason: "locked" as const };
    }
    await prisma.verificationCode.update({
      where: { id: row.id },
      data: { attempts },
    });
    return {
      ok: false as const,
      reason: "invalid" as const,
      left: MAX_ATTEMPTS - attempts,
    };
  }

  await prisma.verificationCode.delete({ where: { id: row.id } });
  return { ok: true as const };
}

function setSessionCookie(sessionToken: string, expires: Date) {
  const secure = process.env.NODE_ENV === "production";
  cookies().set(sessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires,
  });
}

export function clearSessionCookie() {
  cookies().set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
}

export async function establishExclusiveSession(userId: string) {
  const meta = requestMeta();
  const previous = await prisma.session.findMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });
  setSessionCookie(sessionToken, expires);

  return {
    replaced: previous.length > 0,
    meta,
    previous: previous[0],
  };
}

export async function touchSession(userId: string) {
  await prisma.session.updateMany({
    where: { userId, expires: { gt: new Date() } },
    data: { lastActiveAt: new Date() },
  });
}

function isSeededAdmin(email: string) {
  const extra = process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase();
  return email === SEEDED_ADMIN_EMAIL || (extra ? email === extra : false);
}

export async function upsertLoginUser(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.suspended) return { ok: false as const, reason: "suspended" as const };
    if (isSeededAdmin(email) && existing.role !== Role.ADMIN) {
      return {
        ok: true as const,
        user: await prisma.user.update({
          where: { id: existing.id },
          data: { role: Role.ADMIN, emailVerified: existing.emailVerified ?? new Date() },
        }),
      };
    }
    if (!existing.emailVerified) {
      return {
        ok: true as const,
        user: await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerified: new Date() },
        }),
      };
    }
    return { ok: true as const, user: existing };
  }

  const user = await prisma.user.create({
    data: {
      email,
      emailVerified: new Date(),
      role: isSeededAdmin(email) ? Role.ADMIN : Role.STUDENT,
    },
  });
  return { ok: true as const, user };
}
