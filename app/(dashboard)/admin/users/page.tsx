import Link from "next/link";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnGhost } from "@/app/components/dashboard/ui";
import { ConfirmSubmit } from "@/app/components/dashboard/ConfirmSubmit";
import { setSuspended, setUserRole } from "@/app/actions/admin";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

const roles: Role[] = ["ADMIN", "TEACHER", "STUDENT"];

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: { role?: string; page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const roleFilter = roles.includes(searchParams.role as Role)
    ? (searchParams.role as Role)
    : undefined;
  const where = roleFilter ? { role: roleFilter } : undefined;
  const extra = roleFilter ? `&role=${roleFilter}` : "";
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.users, lang)} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/users" className={btnGhost}>
          Tous
        </Link>
        {roles.map((role) => (
          <Link key={role} href={`/admin/users?role=${role}`} className={btnGhost}>
            {role}
          </Link>
        ))}
      </div>
      {users.length === 0 ? (
        <EmptyState>{t(dash.empty.users, lang)}</EmptyState>
      ) : (
        <ul className="space-y-3 md:hidden">
          {users.map((row) => (
            <li key={row.id} className="rounded-2xl border border-ink-line bg-ink-card p-4">
              <Link href={`/admin/users/${row.id}`} className="font-body text-sm text-cream">
                {row.name || row.email}
              </Link>
              <p className="mt-1 font-body text-xs text-cream-faint" dir="ltr">
                {row.email}
              </p>
              <p className="mt-2 font-body text-xs text-cream-dim">
                {row.role} · {row.suspended ? "suspendu" : "actif"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/admin/users/${row.id}`} className={btnGhost}>
                  {t(dash.admin.editUser, lang)}
                </Link>
                <ConfirmSubmit
                  action={setSuspended.bind(null, row.id, !row.suspended)}
                  message={
                    row.suspended
                      ? "Réactiver ce compte ?"
                      : "Suspendre ce compte ? Il ne pourra plus se connecter."
                  }
                  label={row.suspended ? t(dash.admin.restore, lang) : t(dash.admin.suspend, lang)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {users.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border border-ink-line md:block">
          <table className="w-full text-start font-body text-sm">
            <thead className="border-b border-ink-line text-cream-faint">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <tr key={row.id} className="border-b border-ink-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${row.id}`} className="text-cream hover:text-gold">
                      {row.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {roles.map((role) => (
                        <form key={role} action={setUserRole.bind(null, row.id, role)}>
                          <button
                            type="submit"
                            className={`min-h-11 px-2 ${row.role === role ? "text-gold" : "text-cream-faint"}`}
                          >
                            {role}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream-dim">{row.suspended ? "suspendu" : "actif"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/users/${row.id}`} className={btnGhost}>
                        {t(dash.admin.editUser, lang)}
                      </Link>
                      <ConfirmSubmit
                        action={setSuspended.bind(null, row.id, !row.suspended)}
                        message={
                          row.suspended
                            ? "Réactiver ce compte ?"
                            : "Suspendre ce compte ? Il ne pourra plus se connecter."
                        }
                        label={row.suspended ? t(dash.admin.restore, lang) : t(dash.admin.suspend, lang)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Pager page={page} pageCount={pageCount(total)} extra={extra} />
    </div>
  );
}
