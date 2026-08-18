import type { Role } from "@prisma/client";
import type { L10n } from "@/lib/i18n";
import { dash } from "@/content/dashboard";

export type DashItem = {
  href: string;
  label: L10n;
  tab?: boolean;
  icon: "home" | "book" | "compass" | "award" | "user" | "layout" | "users" | "inbox" | "quote" | "shield" | "star" | "film" | "orders" | "settings" | "mail";
};

export function navForRole(role: Role): { items: DashItem[]; tabs: DashItem[] } {
  if (role === "ADMIN") {
    const items: DashItem[] = [
      { href: "/admin", label: dash.nav.overview, tab: true, icon: "layout" },
      { href: "/admin/users", label: dash.nav.users, tab: true, icon: "users" },
      { href: "/admin/applications", label: dash.nav.applications, icon: "inbox" },
      { href: "/admin/billing", label: dash.nav.billing, icon: "orders" },
      { href: "/admin/messages", label: dash.nav.messages, icon: "mail" },
      { href: "/admin/courses", label: dash.nav.courses, tab: true, icon: "book" },
      { href: "/admin/library", label: dash.nav.library, icon: "film" },
      { href: "/admin/testimonials", label: dash.nav.testimonials, icon: "quote" },
      { href: "/admin/sessions", label: dash.nav.sessions, icon: "shield" },
      { href: "/admin/settings", label: dash.nav.settings, icon: "settings" },
    ];
    return { items, tabs: items.filter((item) => item.tab) };
  }
  if (role === "TEACHER") {
    const items: DashItem[] = [
      { href: "/teacher", label: dash.nav.overview, tab: true, icon: "layout" },
      { href: "/teacher/courses", label: dash.nav.courses, tab: true, icon: "book" },
      { href: "/teacher/students", label: dash.nav.students, icon: "users" },
      { href: "/teacher/reviews", label: dash.nav.reviews, icon: "star" },
      { href: "/teacher/profile", label: dash.nav.profile, tab: true, icon: "user" },
    ];
    return { items, tabs: items.filter((item) => item.tab) };
  }
  const items: DashItem[] = [
    { href: "/student", label: dash.nav.home, tab: true, icon: "home" },
    { href: "/student/courses", label: dash.nav.courses, tab: true, icon: "book" },
    { href: "/student/browse", label: dash.nav.browse, icon: "compass" },
    { href: "/student/certificates", label: dash.nav.certificates, icon: "award" },
    { href: "/student/profile", label: dash.nav.profile, tab: true, icon: "user" },
  ];
  return { items, tabs: items.filter((item) => item.tab) };
}

export function pick(fr: string, ar: string, locale: string) {
  return locale === "ar" ? ar || fr : fr;
}
