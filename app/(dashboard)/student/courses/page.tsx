import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, ProgressBar } from "@/app/components/dashboard/ui";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function StudentCourses({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.STUDENT);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, enrollments] = await Promise.all([
    prisma.enrollment.count({ where: { userId: user.id } }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.courses, lang)} />
      {total === 0 ? (
        <EmptyState
          action={
            <Link href="/student/browse" className="inline-flex min-h-11 items-center rounded-full bg-gold px-5 font-body text-sm font-medium text-ink">
              {t(dash.nav.browse, lang)}
            </Link>
          }
        >
          {t(dash.empty.courses, lang)}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {enrollments.map((row) => (
            <li key={row.id}>
              <Link
                href={`/student/courses/${row.course.slug}`}
                className="block min-h-11 rounded-2xl border border-ink-line bg-ink-card p-5"
              >
                <h2 className="font-display text-lg font-semibold">
                  {pick(row.course.titleFr, row.course.titleAr, user.locale)}
                </h2>
                <p className="mt-2 font-body text-sm text-cream-dim">
                  {Math.round(row.progress)}%
                </p>
                <div className="mt-3">
                  <ProgressBar value={row.progress} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
