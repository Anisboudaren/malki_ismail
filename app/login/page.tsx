"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { requestLoginCode } from "@/app/actions/auth";
import { DocumentLocale } from "@/app/components/DocumentLocale";
import { BusyLabel } from "@/app/components/ui/BusyLabel";
import {
  remainingLoginCooldown,
  startLoginCooldown,
} from "@/lib/login-cooldown";

const locale: Locale = "fr";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const [error, setError] = useState<string | null>(
    searchParams.error === "suspended" ? t(dash.verify.suspended, locale) : null,
  );
  const [wait, setWait] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const tick = () => setWait(remainingLoginCooldown());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  const blocked = wait > 0;
  const waitLabel = t(dash.login.wait, locale).replace("{n}", String(wait));

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
        <p className="mt-1 font-body text-[0.65rem] uppercase tracking-ultrawide text-gold-muted">
          Academy
        </p>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
          {t(dash.login.title, locale)}
        </h1>
        <div className="dash-gold-rule mt-4" />
        <p className="mt-4 font-body text-sm leading-relaxed text-cream-dim">
          {t(dash.login.body, locale)}
        </p>
        {error ? <p className="mt-4 font-body text-sm text-gold">{error}</p> : null}
        {blocked ? (
          <p className="mt-4 font-latin text-sm tabular-nums text-gold">{waitLabel}</p>
        ) : null}
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (remainingLoginCooldown() > 0) {
              setWait(remainingLoginCooldown());
              setError(t(dash.login.rate, locale));
              return;
            }
            const formData = new FormData(event.currentTarget);
            startLoginCooldown();
            setWait(remainingLoginCooldown());
            startTransition(async () => {
              const result = await requestLoginCode(formData);
              if (result.ok) return;
              if (result.reason === "rate") {
                startLoginCooldown((result.wait ?? 90) * 1000);
                setWait(remainingLoginCooldown());
                setError(t(dash.login.rate, locale));
                return;
              }
              setError(t(dash.verify.invalid, locale));
            });
          }}
        >
          <label className="block">
            <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
              {t(dash.login.email, locale)}
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              dir="ltr"
              disabled={blocked || pending}
              className="mt-2 min-h-12 w-full rounded-2xl border border-ink-line bg-ink px-4 font-body text-sm text-cream outline-none transition-colors duration-300 ease-cinema focus:border-gold-muted disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={pending || blocked}
            aria-busy={pending}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-gold font-body text-sm font-medium text-ink transition-colors duration-300 ease-cinema hover:bg-cream disabled:opacity-60"
          >
            {blocked ? (
              waitLabel
            ) : pending ? (
              <BusyLabel>{t(dash.login.sending, locale)}</BusyLabel>
            ) : (
              t(dash.login.send, locale)
            )}
          </button>
        </form>
        <p className="mt-8 text-center font-body text-xs text-cream-faint">
          <Link href="/fr" className="transition-colors hover:text-cream">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
