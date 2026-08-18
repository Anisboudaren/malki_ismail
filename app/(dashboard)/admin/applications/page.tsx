import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnClass, btnGhost } from "@/app/components/dashboard/ui";
import { reviewApplication } from "@/app/actions/admin";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const where = { status: "PENDING" as const };
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, apps] = await Promise.all([
    prisma.teacherApplication.count({ where }),
    prisma.teacherApplication.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.applications, lang)} />
      {apps.length === 0 ? (
        <EmptyState>{t(dash.empty.applications, lang)}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {apps.map((app) => (
            <li key={app.id} className="rounded-2xl border border-ink-line bg-ink-card p-5">
              <p className="font-body text-sm font-semibold">{app.user.email}</p>
              <p className="mt-2 font-body text-sm text-cream-dim">{app.message}</p>
              <div className="mt-4 flex gap-2">
                <form action={reviewApplication.bind(null, app.id, "APPROVED")}>
                  <button className={btnClass}>{t(dash.admin.approve, lang)}</button>
                </form>
                <form action={reviewApplication.bind(null, app.id, "REJECTED")}>
                  <button className={btnGhost}>{t(dash.admin.reject, lang)}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
