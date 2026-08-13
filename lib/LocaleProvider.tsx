"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import {
  DEFAULT_LOCALE,
  alt as altOf,
  t as tOf,
  type L10n,
  type Locale,
} from "./i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export interface Translator {
  locale: Locale;
  isRtl: boolean;
  /** The string in the active language. */
  t: (value: L10n) => string;
  /** The string in the other language, for the bilingual accent text. */
  alt: (value: L10n) => string;
  /** `lang` for the accent text, so it gets the right font and bidi treatment. */
  altLang: Locale;
}

/** Almost every section is a client component, so copy is resolved through this. */
export function useT(): Translator {
  const locale = useLocale();
  return useMemo(
    () => ({
      locale,
      isRtl: locale === "ar",
      t: (value: L10n) => tOf(value, locale),
      alt: (value: L10n) => altOf(value, locale),
      altLang: locale === "fr" ? ("ar" as const) : ("fr" as const),
    }),
    [locale]
  );
}
