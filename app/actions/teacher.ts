"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/lms";
import { storedVideoUrl } from "@/lib/video-src";
import { flash } from "@/lib/save-result";

async function lessonMediaFromForm(formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "").trim() || null;
  let videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  let thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || null;
  if (mediaId) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
    if (asset) {
      videoUrl = storedVideoUrl(asset.url, asset.publitioId);
      thumbnailUrl = asset.thumbnailUrl;
    }
  } else if (videoUrl) {
    videoUrl = storedVideoUrl(videoUrl);
  }
  return { mediaId, videoUrl, thumbnailUrl };
}

export async function createCourse(formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const categorySlug = String(formData.get("categorySlug") ?? "photographie");
  if (!titleFr) return;
  const base = slugify(titleFr) || `cours-${Date.now()}`;
  let slug = base;
  let n = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  const course = await prisma.course.create({
    data: {
      titleFr,
      titleAr: titleAr || titleFr,
      slug,
      categorySlug,
      teacherId: user.id,
    },
  });
  await prisma.module.create({
    data: { courseId: course.id, titleFr: "Leçons", titleAr: "الدروس", sortOrder: 0 },
  });
  redirect(`/teacher/courses/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: user.id },
  });
  if (!course) return;
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
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function submitCourse(courseId: string) {
  const user = await requireRole(Role.TEACHER);
  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: user.id },
  });
  if (!course) return;
  await prisma.course.update({
    where: { id: courseId },
    data: { submitted: true, published: false },
  });
  revalidatePath("/teacher/courses");
}

export async function addModule(courseId: string, formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: user.id },
    include: { modules: true },
  });
  if (!course) return;
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  if (!titleFr) return;
  await prisma.module.create({
    data: {
      courseId,
      titleFr,
      titleAr: String(formData.get("titleAr") ?? "").trim() || titleFr,
      sortOrder: course.modules.length,
    },
  });
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function addLesson(moduleId: string, courseId: string, formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const mod = await prisma.module.findFirst({
    where: { id: moduleId, course: { teacherId: user.id } },
    include: { lessons: true },
  });
  if (!mod) return;
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  if (!titleFr) return;
  const media = await lessonMediaFromForm(formData);
  await prisma.lesson.create({
    data: {
      moduleId,
      titleFr,
      titleAr: String(formData.get("titleAr") ?? "").trim() || titleFr,
      sortOrder: mod.lessons.length,
      ...media,
    },
  });
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { course: { teacherId: user.id } } },
  });
  if (!lesson) return flash({ ok: false, message: "Leçon introuvable." });
  const titleFr = String(formData.get("titleFr") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  if (!titleFr) return flash({ ok: false, message: "Le titre FR est requis." });
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const data: {
    titleFr: string;
    titleAr: string;
    mediaId?: string;
    videoUrl?: string;
    thumbnailUrl?: string | null;
  } = { titleFr, titleAr };
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
  await prisma.lesson.update({
    where: { id: lessonId },
    data,
  });
  revalidatePath(`/teacher/courses/${courseId}`);
  return flash({ ok: true, message: "Enregistré." });
}

export async function moveLesson(lessonId: string, courseId: string, direction: -1 | 1) {
  const user = await requireRole(Role.TEACHER);
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, module: { course: { teacherId: user.id } } },
  });
  if (!lesson) return;
  const swap = await prisma.lesson.findFirst({
    where: {
      moduleId: lesson.moduleId,
      sortOrder: lesson.sortOrder + direction,
    },
  });
  if (!swap) return;
  await prisma.$transaction([
    prisma.lesson.update({ where: { id: lesson.id }, data: { sortOrder: swap.sortOrder } }),
    prisma.lesson.update({ where: { id: swap.id }, data: { sortOrder: lesson.sortOrder } }),
  ]);
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function updateTeacherProfile(formData: FormData) {
  const user = await requireRole(Role.TEACHER);
  const name = String(formData.get("name") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;
  const credentials = String(formData.get("credentials") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ fr: line, ar: line }));

  await prisma.user.update({
    where: { id: user.id },
    data: { name: name || null, avatarUrl, image: avatarUrl },
  });
  await prisma.teacherProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bioFr: String(formData.get("bioFr") ?? ""),
      bioAr: String(formData.get("bioAr") ?? ""),
      roleFr: String(formData.get("roleFr") ?? ""),
      roleAr: String(formData.get("roleAr") ?? ""),
      credentials,
      instagram: String(formData.get("instagram") ?? "").trim() || null,
      facebook: String(formData.get("facebook") ?? "").trim() || null,
      tiktok: String(formData.get("tiktok") ?? "").trim() || null,
      youtube: String(formData.get("youtube") ?? "").trim() || null,
    },
    update: {
      bioFr: String(formData.get("bioFr") ?? ""),
      bioAr: String(formData.get("bioAr") ?? ""),
      roleFr: String(formData.get("roleFr") ?? ""),
      roleAr: String(formData.get("roleAr") ?? ""),
      credentials,
      instagram: String(formData.get("instagram") ?? "").trim() || null,
      facebook: String(formData.get("facebook") ?? "").trim() || null,
      tiktok: String(formData.get("tiktok") ?? "").trim() || null,
      youtube: String(formData.get("youtube") ?? "").trim() || null,
    },
  });
  revalidatePath("/teacher/profile");
  revalidatePath("/fr");
  revalidatePath("/ar");
  return flash({ ok: true, message: "Enregistré." });
}
