import type { Locale } from "./i18n";

/**
 * Every route is locale-prefixed, so paths are always built from the active
 * locale rather than written as literals in components.
 */

export const homePath = (locale: Locale) => `/${locale}`;

export const categoryPath = (locale: Locale, categoryId: string) =>
  `/${locale}/categories/${categoryId}`;

export const coursePath = (locale: Locale, slug: string) => `/${locale}/courses/${slug}`;

/**
 * Section anchors only exist on the home page. Prefixing them means a nav link
 * clicked from a course or category page navigates home first instead of
 * silently doing nothing.
 */
export const homeAnchor = (locale: Locale, href: string) =>
  href.startsWith("#") ? `/${locale}${href === "#hero" ? "" : href}` : href;

/** Hash → home section; /login and dashboards stay global; other /paths get a locale prefix. */
export function publicHref(locale: Locale, href: string) {
  if (href.startsWith("#")) return homeAnchor(locale, href);
  if (
    href.startsWith("/login") ||
    href.startsWith("/inscription") ||
    href.startsWith("/student") ||
    href.startsWith("/admin") ||
    href.startsWith("/teacher")
  ) {
    return href;
  }
  if (href.startsWith("/")) return `/${locale}${href}`;
  return href;
}
