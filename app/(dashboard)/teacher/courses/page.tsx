import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnClass } from "@/app/components/dashboard/ui";
import { DashCourseCard } from "@/app/components/dashboard/DashCourseCard";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function TeacherCourses({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, courses] = await Promise.all([
    prisma.course.count({ where: { teacherId: user.id } }),
    prisma.course.findMany({
      where: { teacherId: user.id },
      include: {
        modules: { include: { _count: { select: { lessons: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle
        title={t(dash.nav.courses, lang)}
        action={
          <Link href="/teacher/courses/new" className={btnClass}>
            {t(dash.teacher.create, lang)}
          </Link>
        }
      />
      {courses.length === 0 ? (
        <EmptyState action={<Link href="/teacher/courses/new" className={btnClass}>{t(dash.teacher.create, lang)}</Link>}>
          {t(dash.empty.courses, lang)}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce(
              (sum, mod) => sum + mod._count.lessons,
              0,
            );
            return (
              <li key={course.id}>
                <DashCourseCard
                  titleFr={course.titleFr}
                  titleAr={course.titleAr}
                  thumbnailUrl={course.thumbnailUrl}
                  locale={user.locale}
                  studentCount={course._count.enrollments}
                  lessonCount={lessonCount}
                  status={
                    course.published
                      ? t(dash.teacher.published, lang)
                      : course.submitted
                        ? t(dash.teacher.pending, lang)
                        : t(dash.teacher.draft, lang)
                  }
                  editHref={`/teacher/courses/${course.id}`}
                  studentsHref={`/teacher/courses/${course.id}/students`}
                />
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
