"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import { requireEditor, requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { mediaFromPublitio, upsertPublitioVideos } from "@/lib/media-library";
import {
  fileFilename,
  listPublitioVideos,
  sameFilename,
  uploadPublitioFile,
} from "@/lib/publitio";
import { storedVideoUrl } from "@/lib/video-src";
import { flash } from "@/lib/save-result";

export async function syncPublitioLibrary() {
  await requireRole(Role.ADMIN);
  await upsertPublitioVideos();
  revalidatePath("/admin/library");
  revalidatePath("/admin/courses");
  revalidatePath("/teacher/courses");
  return flash({ ok: true, message: "Bibliothèque synchronisée." });
}

async function ingestVideoFile(file: File) {
  const filename = file.name.trim();
  const existing = await prisma.mediaAsset.findFirst({
    where: { filename: { equals: filename, mode: "insensitive" } },
  });
  if (existing) {
    return { ok: true as const, reused: true as const, id: existing.id };
  }

  const remote = await listPublitioVideos(filename);
  const match = remote.find(
    (item) => sameFilename(fileFilename(item), filename) || sameFilename(item.title || "", filename),
  );
  if (match?.id) {
    const data = mediaFromPublitio(match, filename);
    const row = await prisma.mediaAsset.upsert({
      where: { publitioId: match.id },
      create: data,
      update: data,
    });
    return { ok: true as const, reused: true as const, id: row.id };
  }

  const uploaded = await uploadPublitioFile(file, filename);
  const data = mediaFromPublitio({ ...uploaded, title: uploaded.title || filename }, filename);
  const row = await prisma.mediaAsset.upsert({
    where: { publitioId: uploaded.id },
    create: data,
    update: data,
  });
  return { ok: true as const, reused: false as const, id: row.id };
}

async function requireLessonEditor(lessonId: string) {
  const user = await requireEditor();
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return null;
  if (user.role !== Role.ADMIN && lesson.module.course.teacherId !== user.id) return null;
  return lesson;
}

function revalidateLessonCourse(courseId: string, slug?: string | null) {
  revalidatePath("/admin/library");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath("/student/courses");
  if (slug) {
    revalidatePath(`/student/courses/${slug}`);
    revalidatePath(`/fr/courses/${slug}`);
    revalidatePath(`/ar/courses/${slug}`);
  }
}

export async function uploadLibraryVideo(formData: FormData) {
  await requireRole(Role.ADMIN);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, reason: "missing" as const };
  }
  const result = await ingestVideoFile(file);
  revalidatePath("/admin/library");
  return result;
}

export async function attachMediaToLesson(formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "").trim();
  const lessonId = String(formData.get("lessonId") ?? "").trim();
  if (!mediaId || !lessonId) return { ok: false as const };

  const lesson = await requireLessonEditor(lessonId);
  if (!lesson) return { ok: false as const };

  const asset = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
  if (!asset) return { ok: false as const };

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      mediaId: asset.id,
      videoUrl: storedVideoUrl(asset.url, asset.publitioId),
      thumbnailUrl: asset.thumbnailUrl,
    },
  });

  revalidateLessonCourse(lesson.module.courseId, lesson.module.course.slug);
  return { ok: true as const };
}

export async function uploadLessonVideo(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "").trim();
  if (!lessonId) return { ok: false as const, reason: "missing" as const };
  const lesson = await requireLessonEditor(lessonId);
  if (!lesson) return { ok: false as const, reason: "missing" as const };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, reason: "missing" as const };
  }

  const uploaded = await ingestVideoFile(file);
  const attach = new FormData();
  attach.set("mediaId", uploaded.id);
  attach.set("lessonId", lessonId);
  await attachMediaToLesson(attach);
  return uploaded;
}
