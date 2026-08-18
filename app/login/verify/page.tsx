"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { verifyLoginCode } from "@/app/actions/auth";
import { DocumentLocale } from "@/app/components/DocumentLocale";
import { BusyLabel } from "@/app/components/ui/BusyLabel";

const locale: Locale = "fr";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4" lang="fr">
      <DocumentLocale locale={locale} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-20%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgb(var(--gold)/0.12),transparent_65%)]"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-ink-line bg-ink-card p-8 shadow-[0_0_80px_rgb(var(--gold)/0.06)] md:p-10">
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="font-latin-display text-2xl font-semibold tracking-tightest">
          Malki<span className="text-gold">.</span>
        </p>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
          {t(dash.verify.title, locale)}
        </h1>
        <div className="dash-gold-rule mt-4" />
        <p className="mt-4 font-body text-sm leading-relaxed text-cream-dim">
          {t(dash.verify.body, locale)}{" "}
          <span className="bidi-ltr text-cream">{email}</span>
        </p>
        {error ? <p className="mt-4 font-body text-sm text-gold">{error}</p> : null}
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            startTransition(async () => {
              const result = await verifyLoginCode(formData);
              if (result.ok) return;
              const map = {
                invalid: t(dash.verify.invalid, locale),
                expired: t(dash.verify.expired, locale),
                locked: t(dash.verify.locked, locale),
                missing: t(dash.verify.expired, locale),
                suspended: t(dash.verify.suspended, locale),
              };
              setError(map[result.reason]);
            });
          }}
        >
          <input type="hidden" name="email" value={email} />
          <label className="block">
            <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
              {t(dash.verify.code, locale)}
            </span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              dir="ltr"
              className="mt-2 min-h-16 w-full rounded-2xl border border-gold-muted/40 bg-ink px-4 font-latin text-center text-3xl tracking-[0.55em] text-gold outline-none transition-colors duration-300 ease-cinema focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-gold font-body text-sm font-medium text-ink transition-colors duration-300 ease-cinema hover:bg-cream disabled:opacity-60"
          >
            {pending ? (
              <BusyLabel>{t(dash.verify.connecting, locale)}</BusyLabel>
            ) : (
              t(dash.verify.submit, locale)
            )}
          </button>
        </form>
        <Link
          href="/login"
          className="mt-8 inline-flex min-h-11 items-center font-body text-sm text-cream-dim transition-colors hover:text-cream"
        >
          {t(dash.verify.back, locale)}
        </Link>
      </div>
    </div>
  );
}
