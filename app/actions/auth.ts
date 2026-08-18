"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName } from "@/lib/auth-cookie";
import { dashboardHome } from "@/lib/dashboard-home";
import {
  clearSessionCookie,
  consumeLoginCode,
  establishExclusiveSession,
  issueLoginCode,
  upsertLoginUser,
} from "@/lib/auth-session";
import { sendLoginCodeEmail, sendNewLoginEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@") || email.length > 254) return null;
  return email;
}

function normalizeCode(value: unknown) {
  if (typeof value !== "string") return null;
  const code = value.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return null;
  return code;
}

export type RequestCodeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "rate"; wait?: number };

export async function requestLoginCode(
  formData: FormData,
): Promise<RequestCodeResult> {
  const email = normalizeEmail(formData.get("email"));
  if (!email) return { ok: false, reason: "invalid" };

  const issued = await issueLoginCode(email);
  if (!issued.ok) return { ok: false, reason: "rate", wait: issued.wait };

  await sendLoginCodeEmail(email, issued.code);
  redirect(`/login/verify?email=${encodeURIComponent(email)}`);
}

export type VerifyCodeResult =
  | { ok: true }
  | {
      ok: false;
      reason: "invalid" | "expired" | "locked" | "missing" | "suspended";
      left?: number;
    };

export async function verifyLoginCode(
  formData: FormData,
): Promise<VerifyCodeResult> {
  const email = normalizeEmail(formData.get("email"));
  const code = normalizeCode(formData.get("code"));
  if (!email || !code) return { ok: false, reason: "invalid" };

  const consumed = await consumeLoginCode(email, code);
  if (!consumed.ok) return consumed;

  const user = await upsertLoginUser(email);
  if (!user.ok) return { ok: false, reason: "suspended" };

  const session = await establishExclusiveSession(user.user.id);
  if (session.replaced && user.user.notifyEmail) {
    await sendNewLoginEmail(user.user.email, session.meta);
  }

  redirect(dashboardHome(user.user.role));
}

export async function logoutAction() {
  const token = cookies().get(sessionCookieName())?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  }
  clearSessionCookie();
  redirect("/fr");
}
