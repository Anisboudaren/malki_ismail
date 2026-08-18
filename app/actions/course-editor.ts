"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/lms";
import { flash } from "@/lib/save-result";
import { storedVideoUrl } from "@/lib/video-src";

function revalidateCourse(courseId: string) {
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
}

async function uniqueSlug(titleFr: string) {
  const base = slugify(titleFr) || `cours-${Date.now()}`;
  let slug = base;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

export async function ensureCourseModule(courseId: string) {
  const existing = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
  });
  if (existing) return existing;
  return prisma.module.create({
    data: { courseId, titleFr: "Leçons", titleAr: "الدروس", sortOrder: 0 },
  });
}

export async function createAdminCourse(formData: FormData) {
  const user = await requireRole(Role.ADMIN);
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "photographie");
  if (!titleFr) return;
  const course = await prisma.course.create({
    data: {
      titleFr,
      titleAr: titleAr || titleFr,
      slug: await uniqueSlug(titleFr),
      categorySlug,
      teacherId: user.id,
    },
  });
  await ensureCourseModule(course.id);
  redirect(`/admin/courses/${course.id}`);
}

export async function updateAdminCourse(courseId: string, formData: FormData) {
  await requireRole(Role.ADMIN);
  await prisma.course.update({
    where: { id: courseId },
    data: {
      titleFr: String(formData.get("titleFr") ?? "").trim(),
      titleAr: String(formData.get("titleAr") ?? "").trim(),
      summaryFr: String(formData.get("summaryFr") ?? ""),
      summaryAr: String(formData.get("summaryAr") ?? ""),
      categorySlug: String(formData.get("categorySlug") ?? "photographie"),
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || null,
      priceDzd: Number(formData.get("priceDzd")) || null,
    },
  });
  revalidateCourse(courseId);
}

export async function addAdminLesson(courseId: string, formData: FormData) {
  await requireRole(Role.ADMIN);
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  if (!titleFr) return;
  const mod = await ensureCourseModule(courseId);
  const count = await prisma.lesson.count({ where: { module: { courseId } } });
  await prisma.lesson.create({
    data: {
      moduleId: mod.id,
      titleFr,
      titleAr: String(formData.get("titleAr") ?? "").trim() || titleFr,
      sortOrder: count,
    },
  });
  revalidateCourse(courseId);
}

export async function updateAdminLesson(lessonId: string, courseId: string, formData: FormData) {
  await requireRole(Role.ADMIN);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { courseId } },
  });
  if (!lesson) return flash({ ok: false, message: "Leçon introuvable." });
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  if (!titleFr) return flash({ ok: false, message: "Le titre FR est requis." });

  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const data: { titleFr: string; titleAr: string; mediaId?: string; videoUrl?: string; thumbnailUrl?: string | null } = {
    titleFr,
    titleAr,
  };
  if (mediaId) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (asset) {
      data.mediaId = asset.id;
      data.videoUrl = storedVideoUrl(asset.url, asset.publitioId);
      data.thumbnailUrl = asset.thumbnailUrl;
    }
  }

  const unchanged =
    titleFr === lesson.titleFr &&
    titleAr === lesson.titleAr &&
    (!mediaId || mediaId === lesson.mediaId);
  if (unchanged) return flash({ ok: true, message: "Aucun changement." });

  await prisma.lesson.update({ where: { id: lessonId }, data });
  revalidateCourse(courseId);
  return flash({ ok: true, message: "Enregistré." });
}

export async function deleteAdminLesson(lessonId: string, courseId: string) {
  await requireRole(Role.ADMIN);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { courseId } },
  });
  if (!lesson) return;
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidateCourse(courseId);
}

export async function moveAdminLesson(lessonId: string, courseId: string, direction: -1 | 1) {
  await requireRole(Role.ADMIN);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { courseId } },
  });
  if (!lesson) return;
  const swap = await prisma.lesson.findFirst({
    where: { moduleId: lesson.moduleId, sortOrder: lesson.sortOrder + direction },
  });
  if (!swap) return;
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { sortOrder: swap.sortOrder } }),
    prisma.lesson.update({ where: { id: swap.id }, data: { sortOrder: lesson.sortOrder } }),
  ]);
  revalidateCourse(courseId);
}
