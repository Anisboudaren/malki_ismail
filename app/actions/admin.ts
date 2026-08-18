"use server";

import { revalidatePath } from "next/cache";
import { OrderSource, OrderStatus, Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { issueLoginCode } from "@/lib/auth-session";
import { sendLoginCodeEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n";
import { flash } from "@/lib/save-result";
import { activateEnrollment, createBillingOrder } from "@/lib/access";

export async function setUserRole(userId: string, role: Role) {
  await requireRole(Role.ADMIN);
  await prisma.user.update({ where: { id: userId }, data: { role } });
  if (role === Role.TEACHER) {
    await prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function setSuspended(userId: string, suspended: boolean) {
  await requireRole(Role.ADMIN);
  await prisma.user.update({ where: { id: userId }, data: { suspended } });
  if (suspended) {
    await prisma.session.deleteMany({ where: { userId } });
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function reviewApplication(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  await requireRole(Role.ADMIN);
  const app = await prisma.teacherApplication.update({
    where: { id },
    data: { status, reviewedAt: new Date() },
  });
  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: app.userId },
      data: { role: Role.TEACHER },
    });
    await prisma.teacherProfile.upsert({
      where: { userId: app.userId },
      create: { userId: app.userId },
      update: {},
    });
  }
  revalidatePath("/admin/applications");
}

export async function setCoursePublished(courseId: string, published: boolean) {
  await requireRole(Role.ADMIN);
  await prisma.course.update({
    where: { id: courseId },
    data: { published, submitted: published ? false : undefined },
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function setReviewApproved(reviewId: string, approved: boolean) {
  await requireRole(Role.ADMIN);
  await prisma.review.update({ where: { id: reviewId }, data: { approved } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function forceLogout(sessionId: string) {
  await requireRole(Role.ADMIN);
  await prisma.session.delete({ where: { id: sessionId } });
  revalidatePath("/admin/sessions");
}

export async function enrollStudent(formData: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const courseId = String(formData.get("courseId") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !courseId) return;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { priceDzd: true },
  });
  await activateEnrollment(user.id, courseId);
  const existing = await prisma.order.findFirst({
    where: { userId: user.id, courseId, status: { in: [OrderStatus.PAID, OrderStatus.COMP] } },
  });
  if (!existing) {
    await createBillingOrder({
      name: user.name || user.email,
      whatsapp: user.whatsapp,
      email: user.email,
      courseId,
      userId: user.id,
      status: OrderStatus.COMP,
      source: OrderSource.MANUAL_GRANT,
      amountDzd: course?.priceDzd ?? 0,
      confirmedById: admin.id,
    });
  }
  revalidatePath("/admin/courses");
  revalidatePath("/admin/users");
  revalidatePath("/admin/billing");
}

export async function saveCategory(formData: FormData) {
  await requireRole(Role.ADMIN);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;
  const titleFr = String(formData.get("titleFr") ?? slug);
  const titleAr = String(formData.get("titleAr") ?? slug);
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const showOnHome = formData.get("showOnHome") === "on";
  const status = String(formData.get("status") ?? "soon");
  const image = String(formData.get("image") ?? "").trim() || null;
  await prisma.category.upsert({
    where: { slug },
    create: { slug, titleFr, titleAr, sortOrder, showOnHome, status, image },
    update: { titleFr, titleAr, sortOrder, showOnHome, status, image },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function setShowCategorySection(show: boolean) {
  await requireRole(Role.ADMIN);
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", showCategorySection: show },
    update: { showCategorySection: show },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function setCategoryShowOnHome(slug: string, showOnHome: boolean) {
  await requireRole(Role.ADMIN);
  await prisma.category.update({ where: { slug }, data: { showOnHome } });
  revalidatePath("/admin/courses");
  revalidatePath("/fr");
  revalidatePath("/ar");
}

export async function updateAdminUser(userId: string, formData: FormData) {
  await requireRole(Role.ADMIN);
  const name = String(formData.get("name") ?? "").trim() || null;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;
  const localeRaw = String(formData.get("locale") ?? "fr");
  const locale = isLocale(localeRaw) ? localeRaw : "fr";
  const role = String(formData.get("role") ?? "") as Role;
  const suspended = formData.get("suspended") === "on";
  if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
    return flash({ ok: false, message: "Rôle invalide." });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      whatsapp,
      avatarUrl,
      image: avatarUrl,
      locale,
      role,
      suspended,
    },
  });
  if (role === Role.TEACHER) {
    await prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }
  if (suspended) {
    await prisma.session.deleteMany({ where: { userId } });
  }
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return flash({ ok: true, message: "Enregistré." });
}

export async function resetUserAccess(userId: string) {
  await requireRole(Role.ADMIN);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.session.deleteMany({ where: { userId } });
  await prisma.verificationCode.deleteMany({ where: { email: user.email } });

  const issued = await issueLoginCode(user.email, { skipRateLimit: true });
  if (!issued.ok) return;

  await sendLoginCodeEmail(user.email, issued.code);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/sessions");
}

export async function syncUserCourses(userId: string, formData: FormData) {
  const admin = await requireRole(Role.ADMIN);
  const selected = new Set(formData.getAll("courseId").map(String));
  const published = await prisma.course.findMany({
    where: { published: true },
    select: { id: true },
  });
  const current = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const currentIds = new Set(current.map((row) => row.courseId));

  const toGrant = published.filter((course) => selected.has(course.id) && !currentIds.has(course.id));
  const publishedIds = new Set(published.map((course) => course.id));
  const toRevoke = current.filter(
    (row) => publishedIds.has(row.courseId) && !selected.has(row.courseId),
  );

  const student = await prisma.user.findUnique({ where: { id: userId } });
  const prices = await prisma.course.findMany({
    where: { id: { in: toGrant.map((course) => course.id) } },
    select: { id: true, priceDzd: true },
  });
  const priceById = new Map(prices.map((row) => [row.id, row.priceDzd ?? 0]));

  await prisma.$transaction([
    ...toGrant.map((course) =>
      prisma.enrollment.create({ data: { userId, courseId: course.id } }),
    ),
    ...toRevoke.map((row) =>
      prisma.enrollment.delete({
        where: { userId_courseId: { userId, courseId: row.courseId } },
      }),
    ),
  ]);

  for (const course of toGrant) {
    await createBillingOrder({
      name: student?.name || student?.email || "Élève",
      whatsapp: student?.whatsapp,
      email: student?.email,
      courseId: course.id,
      userId,
      status: OrderStatus.COMP,
      source: OrderSource.MANUAL_GRANT,
      amountDzd: priceById.get(course.id) ?? 0,
      confirmedById: admin.id,
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/billing");
  revalidatePath("/student");
  return flash({ ok: true, message: "Enregistré." });
}
