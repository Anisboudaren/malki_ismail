import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnGhost } from "@/app/components/dashboard/ui";
import { forceLogout } from "@/app/actions/admin";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function AdminSessions({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, sessions] = await Promise.all([
    prisma.session.count(),
    prisma.session.findMany({
      include: { user: true },
      orderBy: { lastActiveAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.sessions, lang)} />
      {sessions.length === 0 ? (
        <EmptyState>{t(dash.empty.sessions, lang)}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-line bg-ink-card p-4"
            >
              <div className="min-w-0 font-body text-sm">
                <p>{session.user.email}</p>
                <p className="truncate text-xs text-cream-faint">{session.userAgent}</p>
                <p className="text-xs text-cream-faint">
                  {session.ipAddress} · {session.lastActiveAt.toLocaleString("fr-FR")}
                </p>
              </div>
              <form action={forceLogout.bind(null, session.id)}>
                <button type="submit" className={btnGhost}>
                  {t(dash.admin.forceLogout, lang)}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
