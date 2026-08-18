import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, ProgressRing, StatCard } from "@/app/components/dashboard/ui";

export default async function StudentHome() {
  const user = await requireRole(Role.STUDENT);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
  const activity = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
    include: { lesson: { include: { module: { include: { course: true } } } } },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  const last = enrollments.find((row) => row.lastLessonId) ?? enrollments[0];
  const overall =
    enrollments.length === 0
      ? 0
      : enrollments.reduce((sum, row) => sum + row.progress, 0) / enrollments.length;

  return (
    <div>
      <PageTitle kicker="Tableau de bord" title={t(dash.nav.home, lang)} />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative overflow-hidden rounded-2xl border border-ink-line bg-ink-card p-6">
          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <p className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
            {t(dash.student.continue, lang)}
          </p>
          {last ? (
            <>
              <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {pick(last.course.titleFr, last.course.titleAr, user.locale)}
              </h2>
              <p className="mt-2 font-body text-sm text-cream-dim">
                {Math.round(last.progress)}% {t(dash.student.progress, lang).toLowerCase()}
              </p>
              <Link
                href={`/student/courses/${last.course.slug}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-gold px-5 font-body text-sm font-medium text-ink transition-colors duration-300 ease-cinema hover:bg-cream"
              >
                {t(dash.student.open, lang)}
              </Link>
            </>
          ) : (
            <p className="mt-3 font-body text-sm text-cream-dim">
              {t(dash.empty.courses, lang)}{" "}
              <Link href="/student/browse" className="text-gold">
                {t(dash.nav.browse, lang)}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center justify-center rounded-2xl border border-ink-line bg-ink-card p-6">
          <ProgressRing value={overall} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label={t(dash.nav.courses, lang)} value={enrollments.length} />
        <StatCard
          label={t(dash.nav.certificates, lang)}
          value={enrollments.filter((row) => row.progress >= 100).length}
        />
        <StatCard label={t(dash.student.progress, lang)} value={`${Math.round(overall)}%`} />
      </div>
      <h2 className="mb-3 mt-10 font-display text-lg font-semibold">
        {t(dash.student.activity, lang)}
      </h2>
      {activity.length === 0 ? (
        <EmptyState>{t(dash.empty.courses, lang)}</EmptyState>
      ) : (
        <ul className="divide-y divide-ink-line rounded-2xl border border-ink-line">
          {activity.map((row) => (
            <li key={row.id} className="flex min-h-14 items-center justify-between gap-3 px-4">
              <span className="font-body text-sm">
                {pick(row.lesson.titleFr, row.lesson.titleAr, user.locale)}
              </span>
              <span className="font-body text-xs text-cream-faint">
                {row.completedAt.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
