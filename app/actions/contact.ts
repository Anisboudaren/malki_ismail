"use server";

import { revalidatePath } from "next/cache";
import { ContactStatus, Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { sendContactMessageEmail } from "@/lib/email";
import { flash } from "@/lib/save-result";
import { digits } from "@/lib/phone";

export type ContactField = "name" | "contact" | "message";
export type ContactResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<ContactField, string>> };

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function isWhatsapp(value: string) {
  return digits(value).length >= 8;
}

export async function submitContactMessage(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const errors: Partial<Record<ContactField, string>> = {};

  if (name.length < 2) errors.name = "Indiquez votre nom (2 caractères minimum).";
  if (!contact) errors.contact = "Indiquez un email ou un numéro WhatsApp.";
  else if (!isEmail(contact) && !isWhatsapp(contact)) {
    errors.contact = "Email ou numéro WhatsApp invalide.";
  }
  if (message.length < 10) errors.message = "Le message doit faire au moins 10 caractères.";
  if (message.length > 4000) errors.message = "Message trop long (4000 caractères max).";

  if (Object.keys(errors).length) return { ok: false, errors };

  await prisma.contactMessage.create({
    data: { name, contact, message },
  });

  try {
    await sendContactMessageEmail({ name, contact, message });
  } catch (error) {
    console.error("[contact] email failed", error);
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markContactRead(id: string) {
  await requireRole(Role.ADMIN);
  await prisma.contactMessage.update({
    where: { id },
    data: { status: ContactStatus.READ },
  });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  flash({ ok: true, message: "Marqué comme lu." });
}
