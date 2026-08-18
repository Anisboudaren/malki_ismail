import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { CoursePlayer } from "@/app/components/dashboard/CoursePlayer";

export default async function StudentPlayer({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireRole(Role.STUDENT);
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: user.id, course: { slug: params.slug } },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
            include: { lessons: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
          },
        },
      },
    },
  });
  if (!enrollment) notFound();

  const lessonIds = enrollment.course.modules.flatMap((mod) =>
    mod.lessons.map((lesson) => lesson.id),
  );
  const [progress, notes] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: user.id, lessonId: { in: lessonIds } },
    }),
    prisma.lessonNote.findMany({
      where: { userId: user.id, lessonId: { in: lessonIds } },
    }),
  ]);
  const done = new Set(progress.map((row) => row.lessonId));
  const noteMap = new Map(notes.map((row) => [row.lessonId, row.body]));

  const lessons = enrollment.course.modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({
      id: lesson.id,
      titleFr: lesson.titleFr,
      titleAr: lesson.titleAr,
      videoUrl: lesson.videoUrl || lesson.media?.url || null,
      publitioId: lesson.media?.publitioId ?? null,
      completed: done.has(lesson.id),
      note: noteMap.get(lesson.id) ?? "",
      moduleTitle: pick(mod.titleFr, mod.titleAr, user.locale),
    })),
  );

  return (
    <CoursePlayer
      courseId={enrollment.courseId}
      courseTitle={pick(
        enrollment.course.titleFr,
        enrollment.course.titleAr,
        user.locale,
      )}
      lessons={lessons}
      initialLessonId={enrollment.lastLessonId ?? undefined}
      locale={user.locale}
    />
  );
}
