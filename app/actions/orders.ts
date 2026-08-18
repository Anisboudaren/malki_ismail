"use server";

import { revalidatePath } from "next/cache";
import { OrderSource, OrderStatus, Role } from "@prisma/client";

import {
  activateEnrollment,
  createBillingOrder,
  findOrCreateStudent,
  revokeEnrollment,
} from "@/lib/access";
import { getAuthUser, requireRole } from "@/lib/require-user";
import { digits } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { flash } from "@/lib/save-result";

function revalidateBilling(courseId?: string, userId?: string | null) {
  revalidatePath("/admin/billing");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  if (courseId) {
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}/students`);
  }
  if (userId) revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/student");
}

async function courseAmount(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, priceDzd: true, published: true },
  });
  return course;
}

export async function submitGuestOrder(courseId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = digits(String(formData.get("whatsapp") ?? ""));
  if (name.length < 2) return { ok: false as const, error: "Nom requis." };
  if (whatsapp.length < 8) return { ok: false as const, error: "Numéro WhatsApp invalide." };

  const course = await courseAmount(courseId);
  if (!course) return { ok: false as const, error: "Cours introuvable." };

  const user = await getAuthUser();
  const source = user?.id ? OrderSource.ACCOUNT_REQUEST : OrderSource.GUEST_ORDER;
  const duplicate = await prisma.order.findFirst({
    where: {
      courseId: course.id,
      status: OrderStatus.PENDING,
      OR: [...(user?.id ? [{ userId: user.id }] : []), { whatsapp }],
    },
  });
  if (duplicate) return { ok: true as const };

  await createBillingOrder({
    name,
    whatsapp,
    courseId: course.id,
    userId: user?.id ?? null,
    status: OrderStatus.PENDING,
    source,
    amountDzd: course.priceDzd ?? 0,
  });
  if (user?.id) {
    const row = await prisma.user.findUnique({
      where: { id: user.id },
      select: { whatsapp: true, name: true },
    });
    if (row && !row.whatsapp) {
      await prisma.user.update({
        where: { id: user.id },
        data: { whatsapp, name: row.name || name },
      });
    }
  }
  revalidateBilling(course.id, user?.id);
  return { ok: true as const };
}

export async function requestCourseAccess(courseId: string, formData: FormData) {
  const sessionUser = await getAuthUser();
  if (!sessionUser) return { ok: false as const, error: "Connectez-vous pour demander l’accès." };
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return { ok: false as const, error: "Compte introuvable." };

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (enrolled) return { ok: true as const };

  const whatsapp = digits(String(formData.get("whatsapp") ?? user.whatsapp ?? ""));
  const name = String(formData.get("name") ?? user.name ?? "").trim() || user.email;
  if (whatsapp.length < 8) return { ok: false as const, error: "Numéro WhatsApp invalide." };

  const course = await courseAmount(courseId);
  if (!course) return { ok: false as const, error: "Cours introuvable." };

  const duplicate = await prisma.order.findFirst({
    where: { courseId: course.id, userId: user.id, status: OrderStatus.PENDING },
  });
  if (duplicate) return { ok: true as const };

  await createBillingOrder({
    name,
    whatsapp,
    email: user.email,
    courseId: course.id,
    userId: user.id,
    status: OrderStatus.PENDING,
    source: OrderSource.ACCOUNT_REQUEST,
    amountDzd: course.priceDzd ?? 0,
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { whatsapp, name: user.name || name },
  });
  revalidateBilling(course.id, user.id);
  return { ok: true as const };
}

export async function markOrderPaid(orderId: string, formData?: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return flash({ ok: false, message: "Commande introuvable." });
  if (order.status !== OrderStatus.PENDING) {
    return flash({ ok: false, message: "Seules les commandes en attente peuvent être marquées payées." });
  }

  let userId = order.userId;
  const email = String(formData?.get("email") ?? order.email ?? "").trim().toLowerCase();

  if (!userId) {
    const student = await findOrCreateStudent({
      name: order.name,
      email: email || null,
      whatsapp: order.whatsapp,
    });
    if (!student) {
      return flash({
        ok: false,
        message: "Ajoutez un email pour créer le compte élève.",
      });
    }
    userId = student.id;
  }

  await activateEnrollment(userId, order.courseId);
  await prisma.order.update({
    where: { id: orderId },
    data: {
      userId,
      email: email || order.email,
      status: OrderStatus.PAID,
      confirmedAt: new Date(),
      confirmedById: admin.id,
    },
  });
  revalidateBilling(order.courseId, userId);
  return flash({ ok: true, message: "Paiement confirmé. Accès activé." });
}

export async function refundOrder(orderId: string, formData: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return flash({ ok: false, message: "Commande introuvable." });
  if (order.status !== OrderStatus.PAID) {
    return flash({ ok: false, message: "Seules les commandes payées peuvent être remboursées." });
  }

  const revoke = formData.get("revoke") === "on";
  if (revoke && order.userId) {
    await revokeEnrollment(order.userId, order.courseId);
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.REFUNDED,
      confirmedById: admin.id,
    },
  });
  revalidateBilling(order.courseId, order.userId);
  return flash({
    ok: true,
    message: revoke
      ? "Remboursé et accès retiré."
      : "Remboursé. L’accès au cours est conservé.",
  });
}

export async function grantCourseAccess(formData: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const courseId = String(formData.get("courseId") ?? "");
  const existingUserId = String(formData.get("userId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const whatsapp = digits(String(formData.get("whatsapp") ?? ""));
  const amountRaw = String(formData.get("amountDzd") ?? "").trim();

  const course = await courseAmount(courseId);
  if (!course) return flash({ ok: false, message: "Cours introuvable." });

  let user =
    existingUserId
      ? await prisma.user.findUnique({ where: { id: existingUserId } })
      : await findOrCreateStudent({ name, email: email || null, whatsapp });

  if (!user) {
    return flash({ ok: false, message: "Indiquez un élève existant, ou un nom + email/WhatsApp." });
  }

  const amount = amountRaw === "" ? (course.priceDzd ?? 0) : Math.max(0, Math.round(Number(amountRaw) || 0));
  const already = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (already) {
    const open = await prisma.order.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
        status: { in: [OrderStatus.PAID, OrderStatus.COMP] },
      },
    });
    if (open) return flash({ ok: false, message: "Cet élève a déjà accès à ce cours." });
  }

  await createBillingOrder({
    name: user.name || name || user.email,
    whatsapp: whatsapp || user.whatsapp,
    email: user.email,
    courseId: course.id,
    userId: user.id,
    status: OrderStatus.COMP,
    source: OrderSource.MANUAL_GRANT,
    amountDzd: amount,
    confirmedById: admin.id,
  });
  await activateEnrollment(user.id, course.id);
  revalidateBilling(course.id, user.id);
  return flash({ ok: true, message: "Accès accordé." });
}

export async function createManualOrder(formData: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const courseId = String(formData.get("courseId") ?? "");
  const existingUserId = String(formData.get("userId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const whatsapp = digits(String(formData.get("whatsapp") ?? ""));
  const amount = Math.max(0, Math.round(Number(formData.get("amountDzd") ?? 0) || 0));
  const statusRaw = String(formData.get("status") ?? "PAID");
  const status =
    statusRaw === "COMP" ? OrderStatus.COMP : statusRaw === "PENDING" ? OrderStatus.PENDING : OrderStatus.PAID;

  const course = await courseAmount(courseId);
  if (!course) return flash({ ok: false, message: "Cours introuvable." });
  if (!existingUserId && name.length < 2) {
    return flash({ ok: false, message: "Nom requis." });
  }

  let user =
    existingUserId
      ? await prisma.user.findUnique({ where: { id: existingUserId } })
      : email || whatsapp
        ? await findOrCreateStudent({ name, email: email || null, whatsapp })
        : null;

  if (existingUserId && !user) return flash({ ok: false, message: "Élève introuvable." });

  await createBillingOrder({
    name: user?.name || name || user?.email || "Sans nom",
    whatsapp: whatsapp || user?.whatsapp,
    email: email || user?.email,
    courseId: course.id,
    userId: user?.id ?? null,
    status,
    source: OrderSource.MANUAL_GRANT,
    amountDzd: amount,
    confirmedById: status === OrderStatus.PENDING ? null : admin.id,
  });

  if (user && (status === OrderStatus.PAID || status === OrderStatus.COMP)) {
    await activateEnrollment(user.id, course.id);
  }

  revalidateBilling(course.id, user?.id);
  return flash({
    ok: true,
    message: status === OrderStatus.PENDING ? "Transaction enregistrée (en attente)." : "Transaction enregistrée.",
  });
}

/** @deprecated kept so old bindings fail closed — use markOrderPaid */
export async function setOrderStatus() {
  await requireRole(Role.ADMIN);
  return flash({ ok: false, message: "Utilisez Facturation → Marquer payé." });
}

export async function convertOrderToUser(orderId: string, formData: FormData) {
  return markOrderPaid(orderId, formData);
}

export async function activateOrderAccess(orderId: string) {
  return markOrderPaid(orderId);
}
