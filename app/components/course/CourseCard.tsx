import Image from "next/image";
import Link from "next/link";

import { courseUi, type Course } from "@/content/content";
import { t as translate, type Locale } from "@/lib/i18n";
import { coursePath } from "@/lib/routes";
import { ArrowRight, Star, Users } from "../ui/Icons";
import { PriceFigure } from "../ui/PriceFigure";

export default function CourseCard({
  course,
  locale,
}: {
  course: Course;
  locale: Locale;
}) {
  const t = (value: Parameters<typeof translate>[0]) => translate(value, locale);
  const { price, social } = course;

  return (
    <Link
      href={coursePath(locale, course.slug)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-line bg-ink-card transition-colors duration-500 ease-cinema hover:border-gold-muted/60"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={course.image}
          alt={t(course.title)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-cinema group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <span className="absolute start-4 top-4 rounded-full bg-gold px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest text-ink">
          {t(course.category)}
        </span>
        <span className="bidi-ltr absolute end-4 top-4 rounded-full bg-ink/80 px-2.5 py-1 font-body text-[0.6875rem] font-semibold text-gold">
          {t(price.discountBadge)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-cream">
          {t(course.title)}
        </h3>

        <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-cream-dim">
          {t(course.summary)}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-xs text-cream-faint">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3 w-3 text-gold" />
            <span className="bidi-ltr font-semibold text-cream">{social.rating}</span>
            <span>
              (<span className="bidi-ltr">{social.reviews}</span>)
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3 w-3 text-gold-muted" />
            <span className="bidi-ltr">{social.enrolled}</span>
          </span>
          {course.meta.slice(0, 2).map((item) => (
            <span key={item.label.fr}>{t(item.value)}</span>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink-line pt-5">
          <p className="flex items-baseline gap-1.5">
            <PriceFigure
              value={price.amount}
              className="font-latin-display text-2xl font-semibold tracking-tightest text-cream"
            />
            <span className="font-body text-sm font-medium text-gold">
              {t(price.currency)}
            </span>
            <span className="ms-1 font-body text-xs text-cream-faint line-through">
              <span className="bidi-ltr">{price.strikeAmount}</span>
            </span>
          </p>

          <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-gold">
            {t(courseUi.viewCourse)}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cinema group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
