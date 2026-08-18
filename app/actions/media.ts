"use server";

import { revalidatePath } from "next/cache";
import { Role, type Prisma } from "@prisma/client";

import { requireEditor, requireRole, requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { storedVideoUrl } from "@/lib/video-src";
import { flash, pickChanged, type SaveResult } from "@/lib/save-result";

async function revalidateCourse(courseId: string, slug?: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  if (slug) {
    revalidatePath(`/fr/courses/${slug}`);
    revalidatePath(`/ar/courses/${slug}`);
    revalidatePath(`/student/courses/${slug}`);
  }
}

export async function setLessonVideoUrl(lessonId: string, url: string) {
  const user = await requireEditor();
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return false;
  if (user.role !== Role.ADMIN && lesson.module.course.teacherId !== user.id) return false;
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { videoUrl: storedVideoUrl(url), mediaId: null },
  });
  await revalidateCourse(lesson.module.courseId, lesson.module.course.slug);
  return true;
}

export async function setLessonThumbUrl(lessonId: string, url: string) {
  const user = await requireEditor();
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return false;
  if (user.role !== Role.ADMIN && lesson.module.course.teacherId !== user.id) return false;
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { thumbnailUrl: url },
  });
  await revalidateCourse(lesson.module.courseId, lesson.module.course.slug);
  return true;
}

export async function setCourseThumbUrl(courseId: string, url: string) {
  const user = await requireEditor();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return false;
  if (user.role !== Role.ADMIN && course.teacherId !== user.id) return false;
  await prisma.course.update({ where: { id: courseId }, data: { thumbnailUrl: url } });
  await revalidateCourse(courseId, course.slug);
  return true;
}

export async function setCoursePreviewUrl(courseId: string, url: string) {
  const user = await requireEditor();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return false;
  if (user.role !== Role.ADMIN && course.teacherId !== user.id) return false;
  await prisma.course.update({
    where: { id: courseId },
    data: { previewVideoUrl: storedVideoUrl(url) },
  });
  await revalidateCourse(courseId, course.slug);
  return true;
}

export async function setAvatarUrl(url: string) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: url, image: url },
  });
  revalidatePath("/student/profile");
  revalidatePath("/teacher/profile");
  revalidatePath("/admin/users");
}

function parseLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ fr: line, ar: line }));
}

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function courseLandingData(formData: FormData) {
  return {
    titleFr: String(formData.get("titleFr") ?? "").trim(),
    titleAr: String(formData.get("titleAr") ?? "").trim(),
    summaryFr: String(formData.get("summaryFr") ?? ""),
    summaryAr: String(formData.get("summaryAr") ?? ""),
    bodyFr: String(formData.get("bodyFr") ?? ""),
    bodyAr: String(formData.get("bodyAr") ?? ""),
    categorySlug: String(formData.get("categorySlug") ?? "photographie"),
    priceDzd: numberOrNull(formData.get("priceDzd")),
    priceStrikeDzd: numberOrNull(formData.get("priceStrikeDzd")),
    currency: String(formData.get("currency") ?? "DZD").trim() || "DZD",
    level: String(formData.get("level") ?? "beginner"),
    language: String(formData.get("language") ?? "ar"),
    durationFr: String(formData.get("durationFr") ?? ""),
    durationAr: String(formData.get("durationAr") ?? ""),
    outcomes: parseLines(formData.get("outcomes")),
    requirements: parseLines(formData.get("requirements")),
    metaTitleFr: String(formData.get("metaTitleFr") ?? ""),
    metaTitleAr: String(formData.get("metaTitleAr") ?? ""),
    metaDescriptionFr: String(formData.get("metaDescriptionFr") ?? ""),
    metaDescriptionAr: String(formData.get("metaDescriptionAr") ?? ""),
    ogImage: String(formData.get("ogImage") ?? "").trim() || null,
  };
}

const PUBLIC_LANDING_KEYS = new Set([
  "titleFr",
  "titleAr",
  "summaryFr",
  "summaryAr",
  "bodyFr",
  "bodyAr",
  "categorySlug",
  "priceDzd",
  "priceStrikeDzd",
  "currency",
  "level",
  "language",
  "durationFr",
  "durationAr",
  "outcomes",
  "requirements",
  "metaTitleFr",
  "metaTitleAr",
  "metaDescriptionFr",
  "metaDescriptionAr",
  "ogImage",
]);

async function patchCourseLanding(courseId: string, formData: FormData): Promise<SaveResult> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return flash({ ok: false, message: "Cours introuvable." });

  const next = courseLandingData(formData);
  if (!next.titleFr) return flash({ ok: false, message: "Le titre FR est requis." });

  const current = {
    titleFr: course.titleFr,
    titleAr: course.titleAr,
    summaryFr: course.summaryFr,
    summaryAr: course.summaryAr,
    bodyFr: course.bodyFr,
    bodyAr: course.bodyAr,
    categorySlug: course.categorySlug,
    priceDzd: course.priceDzd,
    priceStrikeDzd: course.priceStrikeDzd,
    currency: course.currency,
    level: course.level,
    language: course.language,
    durationFr: course.durationFr,
    durationAr: course.durationAr,
    outcomes: course.outcomes,
    requirements: course.requirements,
    metaTitleFr: course.metaTitleFr,
    metaTitleAr: course.metaTitleAr,
    metaDescriptionFr: course.metaDescriptionFr,
    metaDescriptionAr: course.metaDescriptionAr,
    ogImage: course.ogImage,
  };
  const data = pickChanged(current, next);
  if (Object.keys(data).length === 0) {
    return flash({ ok: true, message: "Aucun changement." });
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: data as Prisma.CourseUncheckedUpdateInput,
    });
  } catch {
    return flash({ ok: false, message: "Impossible d'enregistrer." });
  }

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  if (Object.keys(data).some((key) => PUBLIC_LANDING_KEYS.has(key))) {
    revalidatePath(`/fr/courses/${course.slug}`);
    revalidatePath(`/ar/courses/${course.slug}`);
    revalidatePath(`/student/courses/${course.slug}`);
  }
  return flash({ ok: true, message: "Enregistré." });
}

export async function updateAdminCourseLanding(courseId: string, formData: FormData) {
  await requireRole(Role.ADMIN);
  return patchCourseLanding(courseId, formData);
}

export async function updateTeacherCourseLanding(courseId: string, formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const owned = await prisma.course.findFirst({ where: { id: courseId, teacherId: user.id } });
  if (!owned) return flash({ ok: false, message: "Cours introuvable." });
  return patchCourseLanding(courseId, formData);
}
