"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { brand, nav } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { LOCALES, LOCALE_LABEL, LOCALE_NAME, isLocale, type Locale } from "@/lib/i18n";
import { homeAnchor, homePath } from "@/lib/routes";
import { dashboardHome, type AppRole } from "@/lib/dashboard-home";
import { Close, Menu } from "./ui/Icons";
import { ButtonLink } from "./ui/Primitives";

export type NavAccount = {
  name: string | null;
  email: string | null;
  role: AppRole;
};

export default function Nav({ account = null }: { account?: NavAccount | null }) {
  const { t, locale } = useT();
  const { scrolled, pastHero } = useNavScrollState();
  const [open, setOpen] = useState(false);
  const href = (target: string) => homeAnchor(locale, target);
  const swapLocale = useLocaleSwap();
  const accountName = accountLabel(account);

  // Don't let the page scroll behind the mobile drawer.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /*
    Three states, not two. The hero is 400vh, so the old "dark once you scroll"
    bar sat over the entire sequence and swallowed it. Over the hero we only
    blur; the solid fill waits until the hero is genuinely behind us.
  */
  const solid = pastHero || open;
  const chrome = solid
    ? "border-b border-ink-line bg-ink/90 backdrop-blur-md"
    : scrolled
      ? "border-b border-transparent backdrop-blur-md"
      : "border-b border-transparent bg-transparent";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-cinema ${chrome}`}
    >
      {/* Faint scrim so white nav text survives the brightest hero frames
          without reintroducing a solid bar. */}
      {!solid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 to-transparent"
        />
      )}

      <div className="shell flex h-[var(--nav-height)] items-center justify-between gap-8">
        <Link
          href={homePath(locale)}
          className="font-latin-display text-lg font-semibold tracking-tightest text-cream"
        >
          {brand.name}
          <span className="text-gold">.</span>
          {/* Arbitrary tracking rather than `tracking-ultrawide`: the wordmark
              stays Latin on /ar and must skip the Arabic tracking override. */}
          <span className="ms-1.5 font-latin text-[0.625rem] font-medium uppercase tracking-[0.28em] text-cream-faint">
            {brand.nameAccent}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.links.map((link) => (
            <Link
              key={link.href + link.label.fr}
              href={href(link.href)}
              className="group relative font-body text-sm text-cream-dim transition-colors duration-300 ease-cinema hover:text-cream"
            >
              {t(link.label)}
              <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-gold transition-all duration-300 ease-cinema group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher active={locale} />
          <span aria-hidden className="h-4 w-px bg-ink-line" />
          {account ? (
            <>
              <span className="flex min-w-0 max-w-[12rem] flex-col items-end leading-tight">
                <span className="font-body text-[0.65rem] uppercase tracking-wide text-gold">
                  {t(nav.signedIn)}
                </span>
                <span className="truncate font-body text-sm text-cream" title={account.email ?? undefined}>
                  {accountName}
                </span>
              </span>
              <ButtonLink href={dashboardHome(account.role)} variant="gold">
                {t(nav.account)}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href={href(nav.login.href)} variant="ghost">
                {t(nav.login.label)}
              </ButtonLink>
              <ButtonLink href={href(nav.cta.href)} variant="gold">
                {t(nav.cta.label)}
              </ButtonLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher active={locale} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t(open ? nav.closeMenu : nav.openMenu)}
            aria-expanded={open}
            className="-me-2 p-2 text-cream"
          >
            {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-ink-line bg-ink lg:hidden"
          >
            <nav className="shell flex flex-col py-6">
              {nav.links.map((link) => (
                <Link
                  key={link.href + link.label.fr}
                  href={href(link.href)}
                  onClick={() => setOpen(false)}
                  className="border-b border-ink-line py-4 font-display text-2xl font-medium tracking-tight text-cream"
                >
                  {t(link.label)}
                </Link>
              ))}

              <div className="mt-6 flex flex-col gap-3">
                {account ? (
                  <>
                    <p className="font-body text-sm text-cream-dim">
                      <span className="me-2 text-[0.65rem] uppercase tracking-wide text-gold">
                        {t(nav.signedIn)}
                      </span>
                      {accountName}
                    </p>
                    <ButtonLink
                      href={dashboardHome(account.role)}
                      variant="gold"
                      size="lg"
                      onClick={() => setOpen(false)}
                    >
                      {t(nav.account)}
                    </ButtonLink>
                  </>
                ) : (
                  <>
                    <ButtonLink
                      href={href(nav.cta.href)}
                      variant="gold"
                      size="lg"
                      onClick={() => setOpen(false)}
                    >
                      {t(nav.cta.label)}
                    </ButtonLink>
                    <ButtonLink
                      href={href(nav.login.href)}
                      variant="outline"
                      size="lg"
                      onClick={() => setOpen(false)}
                    >
                      {t(nav.login.label)}
                    </ButtonLink>
                  </>
                )}
              </div>

              <div className="mt-8 border-t border-ink-line pt-6">
                <p className="eyebrow mb-4">{t(nav.languageLabel)}</p>
                <div className="flex gap-3">
                  {LOCALES.map((code) => (
                    <Link
                      key={code}
                      href={swapLocale(code)}
                      lang={code}
                      hrefLang={code}
                      aria-current={code === locale ? "true" : undefined}
                      className={`flex-1 rounded-full border px-5 py-3 text-center font-body text-sm transition-colors duration-300 ease-cinema ${
                        code === locale
                          ? "border-gold-muted/60 bg-gold/10 text-gold"
                          : "border-ink-line text-cream-dim hover:border-cream/40 hover:text-cream"
                      }`}
                    >
                      {LOCALE_NAME[code]}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function accountLabel(account: NavAccount | null) {
  if (!account) return "";
  const name = account.name?.trim();
  if (name) return name;
  return account.email ?? "";
}

/* -------------------------------------------------------------------------- */
/* Language switcher                                                           */
/* -------------------------------------------------------------------------- */

function LocaleSwitcher({ active }: { active: string }) {
  const swap = useLocaleSwap();

  return (
    <div className="flex items-center gap-1.5 font-latin text-xs font-semibold tracking-wide">
      {LOCALES.map((code, i) => (
        <span key={code} className="flex items-center gap-1.5">
          {i > 0 && (
            <span aria-hidden className="text-cream-faint/50">
              ·
            </span>
          )}
          <Link
            href={swap(code)}
            hrefLang={code}
            aria-current={code === active ? "true" : undefined}
            className={`transition-colors duration-300 ease-cinema ${
              code === active ? "text-gold" : "text-cream-faint hover:text-cream"
            }`}
          >
            {LOCALE_LABEL[code]}
          </Link>
        </span>
      ))}
    </div>
  );
}

/**
 * Swapping language should keep you on the page you're reading, so the locale
 * segment is replaced in place rather than sending everyone back to the home
 * page. Slugs are locale-independent, so the target always exists.
 */
function useLocaleSwap() {
  const pathname = usePathname();

  return (code: Locale) => {
    const segments = (pathname ?? "/").split("/");
    // ["", locale, ...rest] — index 1 is always the locale on these routes.
    if (segments.length > 1 && isLocale(segments[1])) {
      segments[1] = code;
      return segments.join("/");
    }
    return `/${code}`;
  };
}

/* -------------------------------------------------------------------------- */
/* Scroll state                                                                */
/* -------------------------------------------------------------------------- */

interface NavScrollState {
  /** Past the very top, so the bar needs some separation from the page. */
  scrolled: boolean;
  /**
   * The hero is fully behind us, so the bar can take its solid fill. Pages
   * without a hero at all (course, category) count as past it from the start,
   * otherwise the bar would float transparently over their content.
   */
  pastHero: boolean;
}

/**
 * Both flags from one rAF-throttled measurement of the `#hero-end` sentinel.
 *
 * An IntersectionObserver looks like the natural fit here and isn't: a 1px
 * sentinel can clear the viewport entirely between two observer samples, which
 * is exactly what an in-page anchor jump does (footer -> `#hero`). The callback
 * never fires, and the header stays stuck on its last state. Reading the rect
 * on scroll is always correct, and we were paying for a scroll listener anyway.
 */
function useNavScrollState(): NavScrollState {
  // Starts non-solid to match the server render; the first measurement after
  // mount flips it on pages that have no hero.
  const [state, setState] = useState<NavScrollState>({
    scrolled: false,
    pastHero: false,
  });

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const sentinel = document.getElementById("hero-end");
      const next: NavScrollState = {
        scrolled: window.scrollY > 24,
        pastHero: sentinel ? sentinel.getBoundingClientRect().top <= 0 : true,
      };
      setState((prev) =>
        prev.scrolled === next.scrolled && prev.pastHero === next.pastHero ? prev : next
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}
