import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, ProgressBar } from "@/app/components/dashboard/ui";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function TeacherStudents({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const where = { course: { teacherId: user.id } };
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, enrollments] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.findMany({
      where,
      include: { user: { include: { sessions: true } }, course: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.students, lang)} />
      {total === 0 ? (
        <EmptyState>{t(dash.empty.students, lang)}</EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-ink-line rounded-2xl border border-ink-line">
            {enrollments.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-body text-sm">{row.user.name ?? row.user.email}</p>
                    <p className="font-body text-xs text-cream-faint">{row.course.titleFr}</p>
                  </div>
                  <p className="font-body text-xs text-cream-faint">{Math.round(row.progress)}%</p>
                </div>
                <div className="mt-2">
                  <ProgressBar value={row.progress} />
                </div>
                <p className="mt-2 font-body text-xs text-cream-faint">
                  {row.user.sessions[0]?.lastActiveAt.toLocaleString(
                    lang === "ar" ? "ar-DZ" : "fr-FR",
                  ) ?? "—"}
                </p>
              </li>
            ))}
          </ul>
          <Pager page={page} pageCount={pageCount(total)} />
        </>
      )}
    </div>
  );
}
