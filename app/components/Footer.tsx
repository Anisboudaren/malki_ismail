"use client";

import { useState, type FormEvent } from "react";

import { brand, footer } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { ArrowRight, socialIcons } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";

export default function Footer() {
  const { t } = useT();

  return (
    <footer id="contact" className="scroll-mt-24 border-t border-ink-line bg-ink">
      <div className="shell py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <div>
            <Reveal>
              <a
                href="#hero"
                className="font-latin-display text-2xl font-semibold tracking-tightest text-cream"
              >
                {brand.name}
                <span className="text-gold">.</span>
                <span className="ms-2 font-latin text-[0.625rem] font-medium uppercase tracking-[0.28em] text-cream-faint">
                  {brand.nameAccent}
                </span>
              </a>
              <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-cream-dim">
                {t(footer.blurb)}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <Newsletter />
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-8 flex gap-3">
                {footer.socials.map((social) => {
                  const Icon = socialIcons[social.icon];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-cream-dim transition-colors duration-300 ease-cinema hover:border-gold hover:text-gold"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {/* Link columns */}
          <div className="grid gap-10 sm:grid-cols-3">
            {footer.columns.map((column, i) => (
              <Reveal key={column.title.fr} delay={0.06 * i}>
                <h3 className="font-body text-[0.625rem] uppercase tracking-ultrawide text-gold-muted">
                  {t(column.title)}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label.fr}>
                      <a
                        href={link.href}
                        className="font-body text-sm text-cream-dim transition-colors duration-300 ease-cinema hover:text-cream"
                      >
                        {t(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Contact strip */}
        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-col gap-4 border-t border-ink-line pt-8 sm:flex-row sm:items-center sm:gap-10">
            {/* Isolated LTR runs: bidi would otherwise shunt the `@` and the
                leading `0` around when the paragraph direction is RTL. */}
            <a
              href={`mailto:${brand.email}`}
              className="font-latin-display text-lg font-medium tracking-tight text-cream transition-colors hover:text-gold"
            >
              <span className="bidi-ltr">{brand.email}</span>
            </a>
            <a
              href={brand.phoneHref}
              className="font-latin-display text-lg font-medium tracking-tight text-cream transition-colors hover:text-gold"
            >
              <span className="bidi-ltr">{brand.phone}</span>
            </a>
          </div>
        </Reveal>

        {/* Legal */}
        <div className="mt-8 flex flex-col gap-4 border-t border-ink-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-cream-faint">{t(footer.copyright)}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footer.legal.map((link) => (
              <li key={link.label.fr}>
                <a
                  href={link.href}
                  className="font-body text-xs text-cream-faint transition-colors hover:text-cream"
                >
                  {t(link.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function Newsletter() {
  const { t } = useT();
  const [submitted, setSubmitted] = useState(false);

  // No backend yet — this only acknowledges the submit locally.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mt-10">
      <h3 className="font-display text-lg font-semibold tracking-tight text-cream">
        {t(footer.newsletter.title)}
      </h3>
      <p className="mt-2 max-w-sm font-body text-sm text-cream-dim">
        {t(footer.newsletter.body)}
      </p>

      {submitted ? (
        <p className="mt-5 font-body text-sm text-gold">{t(footer.newsletter.success)}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex max-w-sm items-center gap-2">
          <label htmlFor="newsletter-email" className="sr-only">
            {t(footer.newsletter.placeholder)}
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            // Email addresses are always Latin; forcing LTR keeps the caret and
            // the `@` where the user expects them on /ar.
            dir="ltr"
            placeholder={t(footer.newsletter.placeholder)}
            className="min-w-0 flex-1 rounded-full border border-ink-line bg-ink-card px-5 py-3 font-body text-sm text-cream placeholder:text-cream-faint focus:border-gold-muted focus:outline-none"
          />
          <button
            type="submit"
            aria-label={t(footer.newsletter.cta)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-colors duration-300 ease-cinema hover:bg-cream"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </form>
      )}
    </div>
  );
}
