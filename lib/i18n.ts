export const LOCALES = ["fr", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** A string that exists in both languages. Every piece of copy uses this. */
export type L10n = { fr: string; ar: string };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The string in the active language. */
export function t(value: L10n, locale: Locale): string {
  return value[locale];
}

/**
 * The string in the *other* language.
 *
 * This drives the bilingual accent pattern: a French heading carries an Arabic
 * subtitle, and on the Arabic page the exact same markup carries a French one.
 */
export function alt(value: L10n, locale: Locale): string {
  return value[locale === "fr" ? "ar" : "fr"];
}

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "ar" : "fr";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** `lang` to put on an element rendering the non-active language. */
export function langAttr(locale: Locale): string {
  return locale;
}

export const LOCALE_LABEL: Record<Locale, string> = {
  fr: "FR",
  ar: "AR",
};

export const LOCALE_NAME: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
};

/** BCP-47 tags used for metadata and hreflang. */
export const LOCALE_TAG: Record<Locale, string> = {
  fr: "fr-DZ",
  ar: "ar-DZ",
};

export const OG_LOCALE: Record<Locale, string> = {
  fr: "fr_DZ",
  ar: "ar_DZ",
};
