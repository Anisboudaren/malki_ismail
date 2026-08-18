import { OrderSource, OrderStatus, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { digits } from "@/lib/phone";

export { digits };

export function guestEmailFromWhatsapp(whatsapp: string) {
  const clean = digits(whatsapp).replace(/^\+/, "") || "unknown";
  return `wa.${clean}@students.malkiacademy.local`;
}

export function isPlaceholderEmail(email: string) {
  return email.endsWith("@students.malkiacademy.local");
}

export async function findOrCreateStudent(input: {
  name: string;
  email?: string | null;
  whatsapp?: string | null;
}) {
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase() || null;
  const whatsapp = input.whatsapp ? digits(input.whatsapp) : "";

  if (email) {
    return prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: name || null,
        whatsapp: whatsapp || null,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
      update: {
        name: name || undefined,
        whatsapp: whatsapp || undefined,
      },
    });
  }

  if (whatsapp.length >= 8) {
    const existing = await prisma.user.findFirst({
      where: { whatsapp },
    });
    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { name: name || existing.name },
      });
    }
    return prisma.user.create({
      data: {
        email: guestEmailFromWhatsapp(whatsapp),
        name: name || null,
        whatsapp,
        role: Role.STUDENT,
        emailVerified: new Date(),
      },
    });
  }

  return null;
}

export async function activateEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
}

export async function revokeEnrollment(userId: string, courseId: string) {
  await prisma.enrollment.deleteMany({
    where: { userId, courseId },
  });
}

export async function createBillingOrder(input: {
  name: string;
  whatsapp?: string | null;
  email?: string | null;
  courseId: string;
  userId?: string | null;
  status: OrderStatus;
  source: OrderSource;
  amountDzd: number;
  confirmedById?: string | null;
}) {
  const confirmed =
    input.status === OrderStatus.PAID || input.status === OrderStatus.COMP
      ? { confirmedAt: new Date(), confirmedById: input.confirmedById ?? null }
      : { confirmedAt: null, confirmedById: null };

  return prisma.order.create({
    data: {
      name: input.name.trim(),
      whatsapp: input.whatsapp ? digits(input.whatsapp) : "",
      email: input.email?.trim().toLowerCase() || null,
      courseId: input.courseId,
      userId: input.userId ?? null,
      status: input.status,
      source: input.source,
      amountDzd: Math.max(0, Math.round(input.amountDzd)),
      ...confirmed,
    },
  });
}
