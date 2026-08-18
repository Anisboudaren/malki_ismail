import { ContactStatus, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnGhost } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { markContactRead } from "@/app/actions/contact";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function AdminMessages({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, messages] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.messages, lang)} />
      {messages.length === 0 ? (
        <EmptyState>Aucun message pour l’instant.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-line">
          <table className="hidden w-full text-start font-body text-sm md:table">
            <thead className="border-b border-ink-line text-cream-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {messages.map((row) => (
                <tr key={row.id} className="border-b border-ink-line last:border-0 align-top">
                  <td className="px-4 py-3 text-cream">
                    {row.name}
                    {row.status === ContactStatus.NEW ? (
                      <span className="ms-2 text-[0.65rem] uppercase tracking-wide text-gold">Nouveau</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-cream-dim" dir="ltr">
                    {row.contact}
                  </td>
                  <td className="max-w-sm px-4 py-3 whitespace-pre-wrap text-cream-dim">{row.message}</td>
                  <td className="px-4 py-3 text-cream-faint">
                    {row.createdAt.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === ContactStatus.NEW ? (
                      <form action={markContactRead.bind(null, row.id)}>
                        <SaveButton label="Marquer lu" pendingLabel="Marquage…" className={btnGhost} />
                      </form>
                    ) : (
                      <span className="font-body text-xs text-cream-faint">Lu</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="space-y-3 p-3 md:hidden">
            {messages.map((row) => (
              <li key={row.id} className="rounded-2xl border border-ink-line bg-ink-card p-4">
                <p className="font-body text-sm text-cream">
                  {row.name}
                  {row.status === ContactStatus.NEW ? (
                    <span className="ms-2 text-[0.65rem] uppercase text-gold">Nouveau</span>
                  ) : null}
                </p>
                <p className="mt-1 font-body text-xs text-cream-dim" dir="ltr">
                  {row.contact}
                </p>
                <p className="mt-3 whitespace-pre-wrap font-body text-sm text-cream-dim">{row.message}</p>
                <p className="mt-2 font-body text-xs text-cream-faint">
                  {row.createdAt.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-FR")}
                </p>
                {row.status === ContactStatus.NEW ? (
                  <form action={markContactRead.bind(null, row.id)} className="mt-3">
                    <SaveButton label="Marquer lu" pendingLabel="Marquage…" className={btnGhost} />
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}