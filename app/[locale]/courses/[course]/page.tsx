import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  categoryById,
  courseBySlug,
  courseUi,
  courses,
  teacher,
} from "@/content/content";
import { DEFAULT_LOCALE, LOCALE_TAG, isLocale, t, type Locale } from "@/lib/i18n";
import { categoryPath, coursePath, homePath } from "@/lib/routes";
import CourseCurriculum from "@/app/components/course/CourseCurriculum";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { ArrowRight, Check, Star, Users } from "@/app/components/ui/Icons";
import { PriceFigure } from "@/app/components/ui/PriceFigure";
import { ButtonLink } from "@/app/components/ui/Primitives";
import { VideoPreview } from "@/app/components/ui/VideoPreview";

interface PageParams {
  locale: string;
  course: string;
}

export function generateStaticParams() {
  return courses.map((course) => ({ course: course.slug }));
}

export function generateMetadata({ params }: { params: PageParams }): Metadata {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const course = courseBySlug(params.course);
  if (!course) return {};

  return {
    title: `${t(course.title, locale)} — Malki Academy`,
    description: t(course.summary, locale),
    alternates: {
      canonical: coursePath(locale, course.slug),
      languages: {
        [LOCALE_TAG.fr]: coursePath("fr", course.slug),
        [LOCALE_TAG.ar]: coursePath("ar", course.slug),
      },
    },
  };
}

export default function CoursePage({ params }: { params: PageParams }) {
  if (!isLocale(params.locale)) notFound();
  const locale: Locale = params.locale;

  const course = courseBySlug(params.course);
  if (!course) notFound();

  const category = categoryById(course.categoryId);
  const { price, social } = course;

  return (
    <main className="pt-[var(--nav-height)]">
      {/* ------------------------------ Header ------------------------------ */}
      <section className="border-b border-ink-line bg-ink-soft">
        <div className="shell py-12 md:py-16">
          <Breadcrumb
            locale={locale}
            items={[
              { label: t(courseUi.home, locale), href: homePath(locale) },
              ...(category
                ? [
                    {
                      label: t(category.title, locale),
                      href: categoryPath(locale, category.id),
                    },
                  ]
                : []),
              { label: t(course.title, locale) },
            ]}
          />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
            <div>
              <span className="inline-flex rounded-full bg-gold px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest text-ink">
                {t(course.category, locale)}
              </span>

              <h1 className="heading-lg mt-6 text-balance">{t(course.title, locale)}</h1>
              {/* The other language as a support line, matching the home page. */}
              <p
                lang={locale === "fr" ? "ar" : "fr"}
                className="mt-3 font-body text-lg text-cream-faint"
              >
                {t(course.title, locale === "fr" ? "ar" : "fr")}
              </p>

              <p className="body-lg mt-6 text-pretty">{t(course.summary, locale)}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-cream-faint">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-gold" />
                  <span className="font-semibold text-cream">
                    <span className="bidi-ltr">{social.rating}</span>
                  </span>
                  <span>{t(social.ratingLabel, locale)}</span>
                  <span>
                    (<span className="bidi-ltr">{social.reviews}</span>{" "}
                    {t(social.reviewsLabel, locale)})
                  </span>
                </span>

                <span aria-hidden className="h-3.5 w-px bg-ink-line" />

                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gold-muted" />
                  <span className="font-semibold text-cream">
                    <span className="bidi-ltr">{social.enrolled}</span>
                  </span>
                  <span>{t(social.enrolledLabel, locale)}</span>
                </span>

                <span aria-hidden className="h-3.5 w-px bg-ink-line" />

                <span>
                  {t(social.updatedLabel, locale)} {t(social.updated, locale)}
                </span>
              </div>
            </div>

            <VideoPreview
              src={course.previewVideo}
              poster={course.image}
              posterAlt={t(course.title, locale)}
              label={t(course.playLabel, locale)}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------- Body ------------------------------- */}
      <div className="shell grid gap-14 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="space-y-16">
          {/* What you'll learn */}
          <section>
            <h2 className="heading-md">{t(course.learnTitle, locale)}</h2>
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {course.learn.map((point) => (
                <li key={point.fr} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  <span className="font-body text-[0.9375rem] leading-relaxed text-cream-dim">
                    {t(point, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <CourseCurriculum course={course} />

          {/* Teacher */}
          <section>
            <h2 className="heading-md">{t(courseUi.taughtBy, locale)}</h2>
            <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-ink-line bg-ink-card p-6 sm:flex-row sm:items-start">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gold-muted/40">
                <Image
                  src={teacher.portrait}
                  alt={t(teacher.name, locale)}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold tracking-tight text-cream">
                  {t(teacher.name, locale)}
                </p>
                <p className="font-body text-sm text-cream-faint">
                  {t(teacher.role, locale)}
                </p>
                <p className="mt-3 font-body text-sm leading-relaxed text-cream-dim">
                  {t(teacher.bio, locale)}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {teacher.credentials.map((credential) => (
                    <li
                      key={credential.fr}
                      className="rounded-full border border-ink-line px-3 py-1 font-body text-[0.6875rem] text-cream-faint"
                    >
                      {t(credential, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* ---------------------------- Buy panel ---------------------------- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-gold-muted/30 bg-ink-card p-7">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <PriceFigure
                value={price.amount}
                className="font-latin-display text-4xl font-semibold tracking-tightest text-cream"
              />
              <span className="font-body text-base font-medium text-gold">
                {t(price.currency, locale)}
              </span>
              <span className="font-body text-sm text-cream-faint line-through">
                <span className="bidi-ltr">{price.strikeAmount}</span>{" "}
                {t(price.currency, locale)}
              </span>
              {/* The leading minus is a neutral, so an un-isolated `-20٪`
                  flips its sign to the far side on /ar. */}
              <span className="bidi-ltr rounded-full bg-gold/15 px-2 py-0.5 font-body text-[0.6875rem] font-semibold text-gold">
                {t(price.discountBadge, locale)}
              </span>
            </div>
            <p className="mt-2 font-body text-xs text-cream-faint">
              {t(price.note, locale)}
            </p>

            <ButtonLink
              href={course.enrolHref}
              variant="gold"
              size="lg"
              className="mt-6 w-full"
            >
              {t(courseUi.enrol, locale)}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </ButtonLink>

            <dl className="mt-7 space-y-px border-t border-ink-line pt-1">
              {course.meta.map((item) => (
                <div
                  key={item.label.fr}
                  className="flex items-baseline justify-between gap-4 border-b border-ink-line py-3"
                >
                  <dt className="font-body text-xs uppercase tracking-ultrawide text-cream-faint">
                    {t(item.label, locale)}
                  </dt>
                  <dd className="text-end font-body text-sm font-medium text-cream">
                    {t(item.value, locale)}
                  </dd>
                </div>
              ))}
            </dl>

            {category && (
              <ButtonLink
                href={categoryPath(locale, category.id)}
                variant="ghost"
                className="mt-5 w-full"
              >
                {t(courseUi.backToCategory, locale)}
              </ButtonLink>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
