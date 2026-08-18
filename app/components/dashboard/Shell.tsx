"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

import { dash } from "@/content/dashboard";
import { navForRole, type DashItem } from "@/lib/dashboard-nav";
import { t, type Locale } from "@/lib/i18n";
import { logoutAction } from "@/app/actions/auth";
import {
  Award,
  Book,
  Clipboard,
  Close,
  Compass,
  Home,
  Inbox,
  Layout,
  Mail,
  LogOut,
  Menu,
  PlayCircle,
  Quote,
  Settings,
  Shield,
  Star,
  User,
  Users,
} from "@/app/components/ui/Icons";
import { ToastProvider } from "@/app/components/dashboard/Toast";
import { NavigationLoader } from "@/app/components/dashboard/NavigationLoader";

const icons = {
  home: Home,
  book: Book,
  compass: Compass,
  award: Award,
  user: User,
  layout: Layout,
  users: Users,
  inbox: Inbox,
  quote: Quote,
  shield: Shield,
  star: Star,
  film: PlayCircle,
  orders: Clipboard,
  settings: Settings,
  mail: Mail,
};

function isActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/teacher" || href === "/student") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  pathname,
  lang,
  compact,
}: {
  item: DashItem;
  pathname: string;
  lang: Locale;
  compact?: boolean;
}) {
  const Icon = icons[item.icon];
  const active = isActive(pathname, item.href);
  if (compact) {
    return (
      <Link
        href={item.href}
        className={`flex min-h-14 flex-col items-center justify-center gap-1 font-body text-[0.65rem] ${
          active ? "text-gold" : "text-cream-faint"
        }`}
      >
        <Icon className="h-5 w-5" />
        {t(item.label, lang)}
      </Link>
    );
  }
  return (
    <Link
      href={item.href}
      className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 font-body text-sm transition-colors duration-300 ease-cinema ${
        active ? "bg-ink-card text-cream" : "text-cream-dim hover:bg-ink-card/70 hover:text-cream"
      }`}
    >
      {active ? (
        <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gold" />
      ) : null}
      <Icon className={`h-4 w-4 ${active ? "text-gold" : ""}`} />
      {t(item.label, lang)}
    </Link>
  );
}

export function DashboardShell({
  role,
  locale,
  name,
  email,
  avatarUrl,
  children,
}: {
  role: Role;
  locale: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const lang = (locale === "ar" ? "ar" : "fr") as Locale;
  const { items, tabs } = navForRole(role);
  const display = name || email || "";
  const initial = display.trim().charAt(0).toUpperCase() || "M";
  const roleLabel =
    role === "ADMIN" ? "Admin" : role === "TEACHER" ? "Formateur" : "Élève";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <ToastProvider>
    <Suspense fallback={null}>
      <NavigationLoader />
    </Suspense>
    <div className="dash-app min-h-dvh bg-ink text-cream" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex min-h-dvh w-full">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-ink-line bg-ink-soft p-5 lg:flex">
          <p className="font-latin-display text-lg font-semibold tracking-tightest">
            {dash.brand}
            <span className="text-gold">.</span>
          </p>
          <p className="mt-1 font-body text-[0.65rem] uppercase tracking-ultrawide text-gold-muted">
            Academy
          </p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ink-line bg-ink-card px-3 py-3">
            {avatarUrl ? (
              // User-provided avatar URLs (any host).
              <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 font-latin text-sm font-semibold text-gold">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-body text-sm text-cream">{display}</p>
              <p className="font-body text-[0.65rem] uppercase tracking-widest text-gold-muted">
                {roleLabel}
              </p>
            </div>
          </div>
          <nav className="mt-6 flex flex-1 flex-col gap-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} lang={lang} />
            ))}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-start font-body text-sm text-cream-dim transition-colors duration-300 ease-cinema hover:text-cream"
            >
              <LogOut className="h-4 w-4" />
              {t(dash.nav.logout, lang)}
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-14 items-center justify-between gap-2 border-b border-ink-line bg-ink/80 px-4 backdrop-blur-md lg:hidden">
            <p className="font-latin-display text-base font-semibold">
              {dash.brand}
              <span className="text-gold">.</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-label="Ouvrir le menu"
                className="grid h-11 w-11 place-items-center rounded-xl text-cream"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <form action={logoutAction}>
                <button type="submit" className="inline-flex min-h-11 items-center gap-2 px-2 font-body text-sm text-cream-dim">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </header>
          <main className="flex-1 px-4 pb-28 pt-6 md:px-8 lg:px-10 lg:pb-12 lg:pt-10">
            {children}
          </main>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-ink/70"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[min(20rem,88vw)] flex-col border-e border-ink-line bg-ink-soft p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-latin-display text-base font-semibold">
                {dash.brand}
                <span className="text-gold">.</span>
              </p>
              <button
                type="button"
                aria-label="Fermer le menu"
                className="grid h-11 w-11 place-items-center rounded-xl text-cream"
                onClick={() => setMenuOpen(false)}
              >
                <Close className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {items.map((item) => (
                <NavLink key={`drawer-${item.href}`} item={item} pathname={pathname} lang={lang} />
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-ink/95 backdrop-blur-md lg:hidden">
        <ul className="grid grid-cols-3">
          {tabs.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} lang={lang} compact />
            </li>
          ))}
        </ul>
      </nav>
    </div>
    </ToastProvider>
  );
}
