import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/dashboard-nav";
import { PageTitle, Pager, StatCard, btnGhost } from "@/app/components/dashboard/ui";
import { CourseStudentsRoster } from "@/app/components/dashboard/CourseStudentsRoster";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function TeacherCourseStudents({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const where = { courseId: params.id, course: { teacherId: user.id } };

  const [course, total, enrollments, stats] = await Promise.all([
    prisma.course.findFirst({
      where: { id: params.id, teacherId: user.id },
      select: { id: true, titleFr: true, titleAr: true },
    }),
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      include: {
        user: {
          include: { sessions: { orderBy: { lastActiveAt: "desc" }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.enrollment.aggregate({
      where,
      _avg: { progress: true },
      _count: { completedAt: true },
    }),
  ]);
  if (!course) notFound();

  return (
    <div>
      <PageTitle
        kicker={t(dash.nav.courses, lang)}
        title={pick(course.titleFr, course.titleAr, user.locale)}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/teacher/courses/${course.id}`} className={btnGhost}>
              {t(dash.admin.editCourse, lang)}
            </Link>
            <Link href="/teacher/courses" className={btnGhost}>
              ← {t(dash.nav.courses, lang)}
            </Link>
          </div>
        }
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={t(dash.nav.students, lang)} value={total} />
        <StatCard
          label={t(dash.admin.averageProgress, lang)}
          value={`${Math.round(stats._avg.progress ?? 0)}%`}
        />
        <StatCard label={t(dash.admin.finishedCount, lang)} value={stats._count.completedAt} />
      </div>
      <CourseStudentsRoster enrollments={enrollments} lang={lang} />
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
