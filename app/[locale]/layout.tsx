import type { Metadata, Viewport } from "next";
import {
  Archivo,
  IBM_Plex_Sans_Arabic,
  Inter,
  Noto_Kufi_Arabic,
} from "next/font/google";

import { brand, meta } from "@/content/content";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { LocaleProvider } from "@/lib/LocaleProvider";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAG,
  OG_LOCALE,
  dirFor,
  isLocale,
  t,
} from "@/lib/i18n";
import "../globals.css";

/*
  Four faces, two per script. globals.css maps --font-display / --font-body
  onto the right pair based on the element's `lang`, so components only ever
  use `font-display` / `font-body` and never care which locale they are in.

  Latin display stands in for Neue Montreal / General Sans (both licensed).
  Swap to the real face via next/font/local when it's purchased.
*/
const latinDisplay = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-latin-display",
  display: "swap",
});

const latinBody = Inter({
  subsets: ["latin"],
  variable: "--font-latin-body",
  display: "swap",
});

// Geometric and architectural — the closest Arabic counterpart to a tight
// bold grotesque, so hero-scale headlines keep the same weight and presence.
const arabicDisplay = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ar-display",
  display: "swap",
});

// Neutral and highly legible at paragraph sizes, where Kufi gets tiring.
const arabicBody = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ar-body",
  display: "swap",
});

const FONT_VARS = [
  latinDisplay.variable,
  latinBody.variable,
  arabicDisplay.variable,
  arabicBody.variable,
].join(" ");

const SITE_URL = "https://malkiacademy.com";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return {
    metadataBase: new URL(SITE_URL),
    title: t(meta.title, locale),
    description: t(meta.description, locale),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [LOCALE_TAG.fr]: "/fr",
        [LOCALE_TAG.ar]: "/ar",
        "x-default": "/fr",
      },
    },
    openGraph: {
      title: `${brand.name} ${brand.nameAccent}`,
      description: t(meta.ogDescription, locale),
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "fr" ? "ar" : "fr"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // An unknown segment is rejected by the page; the layout only needs a sane
  // `lang`/`dir` so the not-found boundary still renders styled.
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return (
    <html lang={locale} dir={dirFor(locale)} className={FONT_VARS}>
      <body className="font-body antialiased">
        <LocaleProvider locale={locale}>
          {/* Chrome lives here so the home page, category pages and course
              pages all share one header and footer. */}
          <Nav />
          {children}
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
