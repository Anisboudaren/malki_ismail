import type { Metadata, Viewport } from "next";

import { brand, meta } from "@/content/content";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { DocumentLocale } from "../components/DocumentLocale";
import { TrackingPixels } from "../components/TrackingPixels";
import { LocaleProvider } from "@/lib/LocaleProvider";
import { getSiteSettings } from "@/lib/site-settings";
import { getNavUser } from "@/lib/require-user";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_TAG,
  OG_LOCALE,
  dirFor,
  isLocale,
  t,
} from "@/lib/i18n";

const SITE_URL = "https://malkiacademy.com";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const settings = await getSiteSettings();
  const title =
    (locale === "ar" ? settings?.siteTitleAr : settings?.siteTitleFr)?.trim() ||
    `${brand.name} ${brand.nameAccent}`;
  const description =
    (locale === "ar" ? settings?.siteDescriptionAr : settings?.siteDescriptionFr)?.trim() ||
    t(meta.description, locale);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [LOCALE_TAG.fr]: "/fr",
        [LOCALE_TAG.ar]: "/ar",
        "x-default": "/fr",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "fr" ? "ar" : "fr"],
      ...(settings?.ogImage ? { images: [{ url: settings.ogImage }] } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const account = await getNavUser();

  return (
    <LocaleProvider locale={locale}>
      <DocumentLocale locale={locale} />
      <TrackingPixels />
      <div lang={locale} dir={dirFor(locale)}>
        <Nav account={account} />
        {children}
        <Footer />
      </div>
    </LocaleProvider>
  );
}
