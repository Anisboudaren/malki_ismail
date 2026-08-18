"use server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isLocale, type Locale } from "@/lib/i18n";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "duplicate" | "error" };

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !email.includes("@")) return null;
  return email;
}

export async function subscribeNewsletter(
  formData: FormData,
): Promise<SubscribeResult> {
  const email = normalizeEmail(formData.get("email"));
  const localeRaw = formData.get("locale");
  const locale: Locale =
    typeof localeRaw === "string" && isLocale(localeRaw) ? localeRaw : "fr";

  if (!email) return { ok: false, reason: "invalid" };

  try {
    await prisma.newsletterSubscriber.create({
      data: { email, locale },
    });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, reason: "duplicate" };
    }
    console.error("newsletter subscribe failed", error);
    return { ok: false, reason: "error" };
  }
}
