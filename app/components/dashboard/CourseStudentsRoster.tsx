import Link from "next/link";

import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, ProgressBar } from "@/app/components/dashboard/ui";

type RosterRow = {
  id: string;
  progress: number;
  completedAt: Date | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    sessions: { lastActiveAt: Date }[];
  };
};

export function CourseStudentsRoster({
  enrollments,
  lang,
  userHref,
}: {
  enrollments: RosterRow[];
  lang: Locale;
  userHref?: (userId: string) => string;
}) {
  const locale = lang === "ar" ? "ar-DZ" : "fr-DZ";
  if (enrollments.length === 0) {
    return <EmptyState>{t(dash.empty.students, lang)}</EmptyState>;
  }

  return (
    <ul className="divide-y divide-ink-line overflow-hidden rounded-2xl border border-ink-line bg-ink-card">
      {enrollments.map((row) => {
        const name = row.user.name ?? row.user.email;
        const lastActive = row.user.sessions[0]?.lastActiveAt;
        const done = Boolean(row.completedAt);
        const body = (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-body text-sm text-cream">{name}</p>
                <p className="mt-0.5 font-body text-xs text-cream-faint" dir="ltr">
                  {row.user.email}
                </p>
              </div>
              <div className="text-end">
                <p className="font-latin-display text-lg font-semibold tabular-nums">
                  {Math.round(row.progress)}%
                </p>
                <p className={`font-body text-[0.65rem] uppercase tracking-wide ${done ? "text-gold" : "text-cream-faint"}`}>
                  {done ? t(dash.admin.completed, lang) : t(dash.admin.inProgress, lang)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={row.progress} />
            </div>
            <p className="mt-3 font-body text-xs text-cream-faint">
              {t(dash.admin.enrolledOn, lang)} {row.createdAt.toLocaleDateString(locale)}
              {lastActive
                ? ` · ${t(dash.admin.lastActive, lang)} ${lastActive.toLocaleString(locale)}`
                : ""}
            </p>
          </>
        );

        return (
          <li key={row.id} className="px-4 py-4 sm:px-5">
            {userHref ? (
              <Link href={userHref(row.user.id)} className="block rounded-xl outline-none ring-gold-muted focus-visible:ring-2">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
