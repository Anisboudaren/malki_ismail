"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { requireRole, requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { recalcEnrollmentProgress } from "@/lib/lms";
import { isLocale } from "@/lib/i18n";
import { flash } from "@/lib/save-result";

export async function markLessonComplete(lessonId: string, courseId: string) {
  const user = await requireRole(Role.STUDENT);
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId },
    update: { completedAt: new Date() },
  });
  await prisma.enrollment.updateMany({
    where: { userId: user.id, courseId },
    data: { lastLessonId: lessonId },
  });
  await recalcEnrollmentProgress(user.id, courseId);
  revalidatePath("/student");
}

export async function saveLessonNote(lessonId: string, body: string) {
  const user = await requireRole(Role.STUDENT);
  await prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, body },
    update: { body },
  });
}

export async function recordLessonView(lessonId: string, courseId: string) {
  const user = await requireRole(Role.STUDENT);
  await prisma.lessonView.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId },
    update: { viewedAt: new Date() },
  });
  await prisma.enrollment.updateMany({
    where: { userId: user.id, courseId },
    data: { lastLessonId: lessonId },
  });
}

export async function updateStudentProfile(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;
  const notifyEmail = formData.get("notifyEmail") === "on";
  const localeRaw = String(formData.get("locale") ?? "fr");
  const locale = isLocale(localeRaw) ? localeRaw : "fr";
  await prisma.user.update({
    where: { id: user.id },
    data: { name: name || null, avatarUrl, image: avatarUrl, notifyEmail, locale },
  });
  revalidatePath("/student/profile");
  return flash({ ok: true, message: "Enregistré." });
}

export async function requestEnrollment(courseId: string) {
  const user = await requireUser();
  const course = await prisma.course.findFirst({
    where: { id: courseId, published: true },
    select: { id: true, slug: true },
  });
  if (!course) return;
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id },
    update: {},
  });
  revalidatePath("/student");
  revalidatePath("/student/browse");
  revalidatePath(`/student/courses/${course.slug}`);
  redirect(`/student/courses/${course.slug}`);
}

export async function applyAsTeacher(formData: FormData) {
  const user = await requireRole(Role.STUDENT);
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return;
  await prisma.teacherApplication.upsert({
    where: { userId: user.id },
    create: { userId: user.id, message },
    update: { message, status: "PENDING", reviewedAt: null },
  });
  revalidatePath("/student/profile");
}

export async function submitReview(courseId: string, formData: FormData) {
  const user = await requireRole(Role.STUDENT);
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();
  if (!rating || rating < 1 || rating > 5) return;
  await prisma.review.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, rating, body },
    update: { rating, body, approved: false },
  });
  revalidatePath("/student/courses");
}
