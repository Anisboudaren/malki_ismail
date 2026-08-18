import Link from "next/link";
import { OrderStatus, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import {
  billingOrderInclude,
  displayOrderName,
  formatDzd,
  getBillingSummary,
  orderSourceLabel,
  orderStatusLabel,
} from "@/lib/billing";
import { EmptyState, PageTitle, Pager, StatCard, btnGhost } from "@/app/components/dashboard/ui";
import { GrantAccessForm, ManualOrderForm, MarkPaidForm, RefundForm } from "@/app/components/dashboard/BillingActions";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "COMP", "REFUNDED"];

export default async function AdminBilling({
  searchParams,
}: {
  searchParams: {
    page?: string;
    status?: string;
    course?: string;
    sort?: string;
    dir?: string;
  };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const status = STATUSES.includes(searchParams.status as OrderStatus)
    ? (searchParams.status as OrderStatus)
    : undefined;
  const courseId = searchParams.course || undefined;
  const sort = searchParams.sort === "status" ? "status" : "date";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));

  const where = {
    ...(status ? { status } : {}),
    ...(courseId ? { courseId } : {}),
  };

  const [summary, total, orders, courses, students] = await Promise.all([
    getBillingSummary(),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: billingOrderInclude,
      orderBy: sort === "status" ? { status: dir } : { createdAt: dir },
      skip,
      take,
    }),
    prisma.course.findMany({
      orderBy: { titleFr: "asc" },
      select: { id: true, titleFr: true, priceDzd: true },
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true },
    }),
  ]);

  const extra = [
    status ? `&status=${status}` : "",
    courseId ? `&course=${courseId}` : "",
    sort !== "date" ? `&sort=${sort}` : "",
    dir !== "desc" ? `&dir=${dir}` : "",
  ].join("");

  const toggleSort = (key: "date" | "status") => {
    const nextDir = sort === key && dir === "desc" ? "asc" : "desc";
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (courseId) params.set("course", courseId);
    params.set("sort", key);
    params.set("dir", nextDir);
    return `/admin/billing?${params.toString()}`;
  };

  return (
    <div>
      <PageTitle
        title={t(dash.nav.billing, lang)}
        action={<ManualOrderForm courses={courses} users={students} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenu total" value={formatDzd(summary.totalRevenue, lang)} />
        <StatCard label="Ce mois" value={formatDzd(summary.monthRevenue, lang)} />
        <StatCard label="En attente" value={formatDzd(summary.pendingAmount, lang)} />
        <StatCard label="Offerts ce mois" value={summary.monthCompCount} />
      </div>

      <form className="mt-6 flex flex-wrap gap-2" method="get">
        <select name="status" defaultValue={status ?? ""} className="min-h-11 rounded-full border border-ink-line bg-ink px-4 font-body text-sm text-cream">
          <option value="">Tous les statuts</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value, lang)}
            </option>
          ))}
        </select>
        <select name="course" defaultValue={courseId ?? ""} className="min-h-11 rounded-full border border-ink-line bg-ink px-4 font-body text-sm text-cream">
          <option value="">Tous les cours</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.titleFr}
            </option>
          ))}
        </select>
        <button type="submit" className={btnGhost}>
          Filtrer
        </button>
      </form>

      <details className="mt-6 rounded-2xl border border-ink-line bg-ink-card p-4">
        <summary className="min-h-11 cursor-pointer font-body text-sm text-cream">
          Accorder un accès (élève existant ou nouveau)
        </summary>
        <div className="mt-4 max-w-xl">
          <GrantAccessForm courses={courses} />
        </div>
      </details>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState>Aucune transaction pour ces filtres.</EmptyState>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border border-ink-line bg-ink-card p-4">
                <p className="font-body text-sm font-medium text-cream">{displayOrderName(order)}</p>
                <p className="mt-1 font-body text-xs text-cream-dim">{order.course.titleFr}</p>
                <p className="mt-1 font-body text-sm text-cream">{formatDzd(order.amountDzd, lang)}</p>
                <p className="mt-1 font-body text-xs text-cream-faint">
                  {orderStatusLabel(order.status, lang)} · {orderSourceLabel(order.source, lang)}
                </p>
                <p className="mt-1 font-body text-xs text-cream-faint">
                  {order.createdAt.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-FR")}
                </p>
                {order.confirmedBy ? (
                  <p className="mt-1 font-body text-xs text-cream-dim">
                    Confirmé par {order.confirmedBy.name || order.confirmedBy.email}
                  </p>
                ) : null}
                <OrderActions order={order} />
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-ink-line md:block">
            <table className="w-full min-w-[720px] text-start font-body text-sm">
              <thead className="border-b border-ink-line text-cream-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Élève</th>
                  <th className="px-4 py-3 font-medium">Cours</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">
                    <Link href={toggleSort("status")} className="hover:text-cream">
                      Statut
                    </Link>
                  </th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">
                    <Link href={toggleSort("date")} className="hover:text-cream">
                      Date
                    </Link>
                  </th>
                  <th className="px-4 py-3 font-medium">Confirmé par</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-ink-line last:border-0">
                    <td className="px-4 py-3">
                      {order.user ? (
                        <Link href={`/admin/users/${order.user.id}`} className="text-cream hover:text-gold">
                          {displayOrderName(order)}
                        </Link>
                      ) : (
                        <span className="text-cream">{displayOrderName(order)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cream-dim">{order.course.titleFr}</td>
                    <td className="px-4 py-3 tabular-nums">{formatDzd(order.amountDzd, lang)}</td>
                    <td className="px-4 py-3">{orderStatusLabel(order.status, lang)}</td>
                    <td className="px-4 py-3 text-cream-faint">{orderSourceLabel(order.source, lang)}</td>
                    <td className="px-4 py-3 text-cream-faint">
                      {order.createdAt.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-cream-faint">
                      {order.confirmedBy ? order.confirmedBy.name || order.confirmedBy.email : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <OrderActions order={order} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pager page={page} pageCount={pageCount(total)} extra={extra} />
    </div>
  );
}

function OrderActions({
  order,
  compact,
}: {
  order: {
    id: string;
    status: OrderStatus;
    userId: string | null;
    user: { id: string } | null;
  };
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-3"}`}>
      {order.status === "PENDING" ? (
        <MarkPaidForm orderId={order.id} needsEmail={!order.userId} />
      ) : null}
      {order.status === "PAID" ? <RefundForm orderId={order.id} /> : null}
      {order.user ? (
        <Link href={`/admin/users/${order.user.id}`} className={btnGhost}>
          Fiche
        </Link>
      ) : null}
    </div>
  );
}
