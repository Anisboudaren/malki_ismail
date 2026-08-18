import { faqPage } from "@/content/content";
import { isLocale, t } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default function FaqPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;

  return (
    <main className="pt-[var(--nav-height)]">
      <div className="shell max-w-2xl py-16 md:py-24">
        <h1 className="heading-lg">{t(faqPage.title, locale)}</h1>
        <dl className="mt-10 space-y-8">
          {faqPage.items.map((item) => (
            <div key={item.q.fr}>
              <dt className="font-display text-xl font-semibold text-cream">{t(item.q, locale)}</dt>
              <dd className="mt-3 font-body text-sm leading-relaxed text-cream-dim">{t(item.a, locale)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
