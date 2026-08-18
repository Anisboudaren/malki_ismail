import { OrderSource, OrderStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const PAID_STATUSES: OrderStatus[] = [OrderStatus.PAID];
export const OPEN_STATUSES: OrderStatus[] = [OrderStatus.PENDING];

export function monthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function formatDzd(amount: number, locale: "fr" | "ar" = "fr") {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "fr-FR").format(amount);
  return locale === "ar" ? `${formatted} دج` : `${formatted} DA`;
}

export function orderStatusLabel(status: OrderStatus, locale: "fr" | "ar" = "fr") {
  const map: Record<OrderStatus, { fr: string; ar: string }> = {
    PENDING: { fr: "En attente", ar: "قيد الانتظار" },
    PAID: { fr: "Payé", ar: "مدفوع" },
    COMP: { fr: "Offert", ar: "مجاني" },
    REFUNDED: { fr: "Remboursé", ar: "مسترد" },
  };
  return map[status][locale];
}

export function orderSourceLabel(source: OrderSource, locale: "fr" | "ar" = "fr") {
  const map: Record<OrderSource, { fr: string; ar: string }> = {
    ACCOUNT_REQUEST: { fr: "Demande compte", ar: "طلب حساب" },
    GUEST_ORDER: { fr: "Commande invité", ar: "طلب زائر" },
    MANUAL_GRANT: { fr: "Accès manuel", ar: "منح يدوي" },
  };
  return map[source][locale];
}

export type BillingSummary = {
  totalRevenue: number;
  monthRevenue: number;
  pendingAmount: number;
  monthCompCount: number;
};

export async function getBillingSummary(now = new Date()): Promise<BillingSummary> {
  const start = monthStart(now);
  const [paidAll, paidMonth, pending, comps] = await Promise.all([
    prisma.order.aggregate({
      where: { status: OrderStatus.PAID },
      _sum: { amountDzd: true },
    }),
    prisma.order.aggregate({
      where: {
        status: OrderStatus.PAID,
        OR: [{ confirmedAt: { gte: start } }, { confirmedAt: null, createdAt: { gte: start } }],
      },
      _sum: { amountDzd: true },
    }),
    prisma.order.aggregate({
      where: { status: OrderStatus.PENDING },
      _sum: { amountDzd: true },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.COMP,
        createdAt: { gte: start },
      },
    }),
  ]);

  return {
    totalRevenue: paidAll._sum.amountDzd ?? 0,
    monthRevenue: paidMonth._sum.amountDzd ?? 0,
    pendingAmount: pending._sum.amountDzd ?? 0,
    monthCompCount: comps,
  };
}

export const billingOrderInclude = {
  course: { select: { id: true, titleFr: true, titleAr: true, slug: true, priceDzd: true } },
  user: { select: { id: true, name: true, email: true } },
  confirmedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderInclude;

export function displayOrderName(order: {
  name: string;
  user?: { name: string | null; email: string } | null;
}) {
  return order.user?.name || order.name || order.user?.email || "—";
}
