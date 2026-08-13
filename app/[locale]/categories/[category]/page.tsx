import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { categories, categoryById, courseUi, coursesInCategory } from "@/content/content";
import { DEFAULT_LOCALE, LOCALE_TAG, isLocale, t, type Locale } from "@/lib/i18n";
import { categoryPath, homeAnchor, homePath } from "@/lib/routes";
import CourseCard from "@/app/components/course/CourseCard";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { Lock } from "@/app/components/ui/Icons";
import { ButtonLink } from "@/app/components/ui/Primitives";

interface PageParams {
  locale: string;
  category: string;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}

export function generateMetadata({ params }: { params: PageParams }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const category = categoryById(params.category);
  if (!category) return {};

  return {
    title: `${t(category.title, locale)} — Malki Academy`,
    description: t(category.intro, locale),
    alternates: {
      canonical: categoryPath(locale, category.id),
      languages: {
        [LOCALE_TAG.fr]: categoryPath("fr", category.id),
        [LOCALE_TAG.ar]: categoryPath("ar", category.id),
      },
    },
  };
}

export default function CategoryPage({ params }: { params: PageParams }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const category = categoryById(params.category);
  if (!category) notFound();

  const list = coursesInCategory(category.id);
  const isLive = category.status === "live";

  return (
    <main className="pt-[var(--nav-height)]">
      {/* ------------------------------ Header ------------------------------ */}
      <section className="relative isolate overflow-hidden border-b border-ink-line">
        <Image
          src={category.image}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className={`object-cover ${isLive ? "opacity-30" : "opacity-15 grayscale"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />

        <div className="shell relative py-14 md:py-20">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t(courseUi.home, locale), href: homePath(locale) },
              { label: t(category.title, locale) },
            ]}
          />

          <span
            className={`mt-8 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest ${
              isLive
                ? "bg-gold text-ink"
                : "border border-cream/15 bg-ink/70 text-cream-faint"
            }`}
          >
            {!isLive && <Lock className="h-3 w-3" />}
            {t(category.statusLabel, locale)}
          </span>

          <h1 className="heading-xl mt-5 text-balance">{t(category.title, locale)}</h1>
          {/* The other language as a support line, matching the home page. */}
          <p
            lang={locale === "fr" ? "ar" : "fr"}
            className="mt-3 font-body text-lg text-cream-faint"
          >
            {t(category.title, locale === "fr" ? "ar" : "fr")}
          </p>
          <p className="body-lg mt-6 max-w-2xl text-pretty">
            {t(category.intro, locale)}
          </p>
        </div>
      </section>

      {/* ------------------------------ Courses ----------------------------- */}
      <section className="shell py-16 md:py-24">
        {list.length > 0 ? (
          <>
            <p className="eyebrow">
              <span className="bidi-ltr">{list.length}</span>{" "}
              {t(
                list.length === 1
                  ? courseUi.courseCountLabel.one
                  : courseUi.courseCountLabel.many,
                locale
              )}
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {list.map((course) => (
                <CourseCard key={course.slug} course={course} locale={locale} />
              ))}
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-xl rounded-2xl border border-ink-line bg-ink-card px-8 py-14 text-center">
            <Lock className="mx-auto h-6 w-6 text-gold-muted" />
            <h2 className="heading-md mt-5">{t(courseUi.emptyTitle, locale)}</h2>
            <p className="mt-4 font-body text-sm leading-relaxed text-cream-dim">
              {t(courseUi.emptyBody, locale)}
            </p>
            <ButtonLink
              href={homeAnchor(locale, "#contact")}
              variant="outline"
              size="lg"
              className="mt-8"
            >
              {t(courseUi.emptyCta, locale)}
            </ButtonLink>
          </div>
        )}
      </section>
    </main>
  );
}
