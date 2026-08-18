"use client";

import { useEffect } from "react";

import { dirFor, isLocale, type Locale } from "@/lib/i18n";

export function DocumentLocale({ locale }: { locale: string }) {
  const lang: Locale = isLocale(locale) ? locale : "fr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dirFor(lang);
  }, [lang]);

  return null;
}
