import { prisma } from "@/lib/prisma";

export async function recalcEnrollmentProgress(userId: string, courseId: string) {
  const total = await prisma.lesson.count({
    where: { module: { courseId } },
  });
  const done = await prisma.lessonProgress.count({
    where: { userId, lesson: { module: { courseId } } },
  });
  const progress = total === 0 ? 0 : (done / total) * 100;
  const completed = total > 0 && done >= total;

  await prisma.enrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: {
      progress,
      completedAt: completed ? new Date() : null,
    },
  });

  if (completed) {
    await prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });
  }

  return progress;
}

export function parseDurationSeconds(value?: string | null) {
  if (!value) return null;
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 1) return Math.round(parts[0]);
  if (parts.length === 2) return Math.round(parts[0] * 60 + parts[1]);
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return null;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function enrolmentsByDay(dates: Date[], days = 14) {
  const buckets = Array.from({ length: days }, () => 0);
  const now = Date.now();
  for (const date of dates) {
    const diff = Math.floor((now - date.getTime()) / (24 * 60 * 60 * 1000));
    if (diff >= 0 && diff < days) buckets[days - 1 - diff] += 1;
  }
  return buckets;
}
