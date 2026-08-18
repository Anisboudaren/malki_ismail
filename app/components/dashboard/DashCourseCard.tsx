import Link from "next/link";

import { dash } from "@/content/dashboard";
import { pick } from "@/lib/dashboard-nav";
import { t, type Locale } from "@/lib/i18n";
import { btnClass, btnGhost } from "@/app/components/dashboard/ui";
import { Users } from "@/app/components/ui/Icons";

function studentCountLabel(n: number, lang: Locale) {
  if (n === 0) return t(dash.admin.studentCountNone, lang);
  if (n === 1) return t(dash.admin.studentCountOne, lang);
  return t(dash.admin.studentCount, lang).replace("{n}", String(n));
}

export function DashCourseCard({
  titleFr,
  titleAr,
  thumbnailUrl,
  locale,
  studentCount,
  lessonCount,
  status,
  editHref,
  studentsHref,
}: {
  titleFr: string;
  titleAr: string;
  thumbnailUrl?: string | null;
  locale: string;
  studentCount: number;
  lessonCount?: number;
  status: string;
  editHref: string;
  studentsHref: string;
}) {
  const lang = (locale === "ar" ? "ar" : "fr") as Locale;
  const title = pick(titleFr, titleAr, locale);
  const lessonsLabel = t(dash.student.lessons, lang).toLowerCase();

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-card">
      <Link
        href={studentsHref}
        aria-label={title}
        className="relative block aspect-[16/10] overflow-hidden bg-ink-soft"
      >
        {thumbnailUrl ? (
          // Dashboard thumbs come from Publitio / Blob.
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-ink-soft to-ink" />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
        <span className="absolute start-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-body text-[0.65rem] uppercase tracking-wide text-gold">
          {status}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-lg font-semibold leading-snug tracking-tight">
          {title}
        </h2>
        <p className="mt-3 inline-flex items-center gap-1.5 font-body text-sm text-cream-dim">
          <Users className="h-4 w-4 text-gold-muted" />
          {studentCountLabel(studentCount, lang)}
          {typeof lessonCount === "number" ? (
            <span className="text-cream-faint">
              · {lessonCount} {lessonsLabel}
            </span>
          ) : null}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={studentsHref} className={btnClass}>
            {t(dash.admin.viewStudents, lang)}
          </Link>
          <Link href={editHref} className={btnGhost}>
            {t(dash.admin.editCourse, lang)}
          </Link>
        </div>
      </div>
    </article>
  );
}
