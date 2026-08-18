import { Resend } from "resend";

import { contactMessageEmail, loginCodeEmail, newLoginEmail } from "@/lib/email-templates";
import { brand } from "@/content/content";

/**
 * TODO(config): add RESEND_API_KEY and EMAIL_FROM to `.env.local` (and Vercel
 * env) before login codes and session alerts actually leave the server.
 * Until then, emails are skipped and the login code is logged in development.
 */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const from = process.env.EMAIL_FROM ?? "Malki Academy <noreply@localhost>";

export async function sendLoginCodeEmail(to: string, code: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[auth] login code for ${to}: ${code}`);
  }

  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — login code not emailed");
    return;
  }

  const template = loginCodeEmail(code);
  await resend.emails.send({
    from,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendNewLoginEmail(
  to: string,
  detail: { userAgent?: string | null; ipAddress?: string | null },
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — login alert not emailed");
    return;
  }

  const device = detail.userAgent?.slice(0, 180) || "un appareil inconnu";
  const ip = detail.ipAddress || "IP inconnue";
  const template = newLoginEmail(device, ip);

  await resend.emails.send({
    from,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendContactMessageEmail(input: {
  name: string;
  contact: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO?.trim() || brand.email;
  if (process.env.NODE_ENV === "development") {
    console.info(`[contact] ${input.name} <${input.contact}>: ${input.message.slice(0, 120)}`);
  }
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — contact message stored only");
    return;
  }
  const template = contactMessageEmail(input);
  await resend.emails.send({
    from,
    to,
    replyTo: input.contact.includes("@") ? input.contact : undefined,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
