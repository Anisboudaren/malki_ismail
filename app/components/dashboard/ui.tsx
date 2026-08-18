import type { ReactNode } from "react";

export function PageTitle({
  title,
  kicker,
  action,
}: {
  title: string;
  kicker?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex min-h-11 flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? <p className="eyebrow mb-2">{kicker}</p> : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <div className="dash-gold-rule mt-4" />
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-line bg-ink-card px-6 py-14 text-center shadow-[0_1px_0_rgb(255_255_255/0.04)]">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-ink-line bg-ink text-cream-dim">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      </div>
      <p className="font-body text-sm leading-relaxed text-cream-dim">{children}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function DashSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-ink-card" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-28 rounded-2xl bg-ink-card" />
        <div className="h-28 rounded-2xl bg-ink-card" />
        <div className="h-28 rounded-2xl bg-ink-card" />
      </div>
      <div className="h-48 rounded-2xl bg-ink-card" />
    </div>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-line bg-ink-card p-5">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <p className="font-body text-[0.65rem] uppercase tracking-ultrawide text-cream-faint">
        {label}
      </p>
      <p className="mt-3 font-latin-display text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
      <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 96 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgb(38 36 33)" strokeWidth="3.5" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="rgb(255 185 6)"
        strokeWidth="3.5"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-cream font-latin text-[0.45rem] font-semibold"
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return <p className="font-body text-sm text-cream-faint">—</p>;
  }
  const max = Math.max(...points, 1);
  const w = 220;
  const h = 48;
  const d = points
    .map((point, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (point / max) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-gold">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-body text-xs uppercase tracking-wide text-cream-faint">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-2xl border border-ink-line bg-ink px-4 font-body text-sm text-cream outline-none transition-colors duration-200 focus:border-cream-dim disabled:text-cream-faint disabled:opacity-60";

export const btnClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 font-body text-sm font-medium text-ink transition-colors duration-300 ease-cinema hover:bg-cream disabled:opacity-60";

export const btnGhost =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink-line px-5 font-body text-sm text-cream-dim transition-colors duration-300 ease-cinema hover:border-gold-muted hover:text-cream";

export function Pager({
  page,
  pageCount,
  extra = "",
}: {
  page: number;
  pageCount: number;
  extra?: string;
}) {
  if (pageCount <= 1) return null;
  const href = (n: number) => `?page=${n}${extra}`;
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <a href={href(page - 1)} className={btnGhost}>
          ←
        </a>
      ) : null}
      <span className="font-body text-sm text-cream-dim">
        {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <a href={href(page + 1)} className={btnGhost}>
          →
        </a>
      ) : null}
    </nav>
  );
}
