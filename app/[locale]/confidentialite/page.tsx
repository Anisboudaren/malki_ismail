import { legalPages } from "@/content/content";
import { isLocale, t } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  return (
    <main className="pt-[var(--nav-height)]">
      <div className="shell max-w-2xl py-16 md:py-24">
        <h1 className="heading-lg">{t(legalPages.privacy.title, params.locale)}</h1>
        <p className="mt-6 font-body text-sm leading-relaxed text-cream-dim">
          {t(legalPages.privacy.body, params.locale)}
        </p>
      </div>
    </main>
  );
}
