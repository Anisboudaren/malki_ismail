import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { enrolmentsByDay } from "@/lib/lms";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, Sparkline, StatCard } from "@/app/components/dashboard/ui";

export default async function TeacherHome() {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    include: { enrollments: true },
  });
  const studentIds = new Set(courses.flatMap((c) => c.enrollments.map((e) => e.userId)));
  const dates = courses.flatMap((c) => c.enrollments.map((e) => e.createdAt));
  const rates = courses.map((c) =>
    c.enrollments.length
      ? Math.round(
          c.enrollments.reduce((s, e) => s + e.progress, 0) / c.enrollments.length,
        )
      : 0,
  );

  return (
    <div>
      <PageTitle kicker="Espace formateur" title={t(dash.nav.overview, lang)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t(dash.nav.students, lang)} value={studentIds.size} />
        <StatCard label={t(dash.nav.courses, lang)} value={courses.length} />
        <StatCard
          label="Complétion moy."
          value={`${rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0}%`}
        />
      </div>
      <div className="mt-6 rounded-2xl border border-ink-line bg-ink-card p-5">
        <p className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
          Inscriptions (14 j)
        </p>
        <div className="mt-4">
          <Sparkline points={enrolmentsByDay(dates)} />
        </div>
      </div>
      <ul className="mt-8 space-y-3">
        {courses.map((course, i) => (
          <li key={course.id}>
            <Link
              href={`/teacher/courses/${course.id}`}
              className="flex min-h-11 items-center justify-between rounded-2xl border border-ink-line bg-ink-card px-4 py-3"
            >
              <span className="font-body text-sm">{course.titleFr}</span>
              <span className="font-body text-xs text-cream-faint">{rates[i]}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
