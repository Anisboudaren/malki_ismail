import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { enrolmentsByDay } from "@/lib/lms";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, Sparkline, StatCard, btnGhost } from "@/app/components/dashboard/ui";
import { formatDzd, getBillingSummary } from "@/lib/billing";
import { ContactStatus } from "@prisma/client";

export default async function AdminHome() {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const [users, courses, enrollments, pendingOrders, unread, billing] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.findMany({ select: { createdAt: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { status: ContactStatus.NEW } }),
    getBillingSummary(),
  ]);

  return (
    <div>
      <PageTitle kicker="Administration" title={t(dash.nav.overview, lang)} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenu total" value={formatDzd(billing.totalRevenue, lang)} />
        <StatCard label={t(dash.nav.users, lang)} value={users} />
        <StatCard label={t(dash.nav.courses, lang)} value={courses} />
        <StatCard label="Inscriptions" value={enrollments.length} />
        <StatCard label="Demandes en attente" value={pendingOrders} />
        <StatCard label="Messages non lus" value={unread} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/billing" className={btnGhost}>
          {t(dash.nav.billing, lang)}
        </Link>
        <Link href="/admin/messages" className={btnGhost}>
          {t(dash.nav.messages, lang)}
        </Link>
        <Link href="/admin/settings" className={btnGhost}>
          {t(dash.nav.settings, lang)}
        </Link>
        <Link href="/admin/library" className={btnGhost}>
          {t(dash.nav.library, lang)}
        </Link>
      </div>
      <div className="mt-6 rounded-2xl border border-ink-line bg-ink-card p-5">
        <p className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
          Croissance (14 j)
        </p>
        <div className="mt-4">
          <Sparkline points={enrolmentsByDay(enrollments.map((row) => row.createdAt))} />
        </div>
      </div>
    </div>
  );
}
