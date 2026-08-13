"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { courseUi, featuredCourse, teacher } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { coursePath } from "@/lib/routes";
import { ArrowRight, Check } from "./ui/Icons";
import { PriceFigure } from "./ui/PriceFigure";
import { Reveal, RevealGroup, revealItem } from "./ui/Reveal";
import { ButtonLink, Section } from "./ui/Primitives";

/**
 * The home page teaser. It stops at "here is the formation and what it costs" —
 * the curriculum, preview video and enrolment all live on the course page.
 */
export default function CourseSpotlight() {
  const { t, alt, altLang, locale } = useT();
  const href = coursePath(locale, featuredCourse.slug);

  return (
    <Section id="formation">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {/* ---------------- Visual column ---------------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Link
                href={href}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ink-line"
              >
                <Image
                  src={featuredCourse.image}
                  alt={t(featuredCourse.title)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-[900ms] ease-cinema group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <span className="absolute start-5 top-5 rounded-full bg-gold px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest text-ink">
                  {t(featuredCourse.category)}
                </span>
              </Link>
            </Reveal>

            {/* Teacher card */}
            <Reveal delay={0.1}>
              <div
                id="formateurs"
                className="mt-6 flex scroll-mt-28 items-start gap-4 rounded-2xl border border-ink-line bg-ink-card p-5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gold-muted/40">
                  <Image
                    src={teacher.portrait}
                    alt={t(teacher.name)}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">{t(teacher.eyebrow)}</p>
                  <p className="mt-1.5 font-display text-xl font-semibold tracking-tight text-cream">
                    {t(teacher.name)}
                  </p>
                  <p className="font-body text-sm text-cream-faint">{t(teacher.role)}</p>
                  <p className="mt-3 font-body text-sm leading-relaxed text-cream-dim">
                    {t(teacher.bio)}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {teacher.credentials.map((credential) => (
                      <li
                        key={credential.fr}
                        className="rounded-full border border-ink-line px-3 py-1 font-body text-[0.6875rem] text-cream-faint"
                      >
                        {t(credential)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ---------------- Copy column ---------------- */}
          <div>
            <Reveal>
              <p className="eyebrow mb-5">{t(featuredCourse.eyebrow)}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="heading-lg text-balance">
                <Link href={href} className="transition-colors hover:text-gold">
                  {t(featuredCourse.title)}
                </Link>
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              {/* The other language as a support line. `lang` only, no `dir`,
                  so it keeps the alignment of the heading above it. */}
              <p lang={altLang} className="mt-3 font-body text-lg text-cream-faint">
                {alt(featuredCourse.title)}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="body-lg mt-6 text-pretty">{t(featuredCourse.summary)}</p>
            </Reveal>

            {/* Meta grid */}
            <RevealGroup className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line">
              {featuredCourse.meta.map((item) => (
                <motion.div key={item.label.fr} variants={revealItem} className="bg-ink p-5">
                  <p className="font-body text-[0.625rem] uppercase tracking-ultrawide text-cream-faint">
                    {t(item.label)}
                  </p>
                  <p className="mt-2 font-display text-base font-medium text-cream">
                    {t(item.value)}
                  </p>
                </motion.div>
              ))}
            </RevealGroup>

            {/* What you'll learn */}
            <div className="mt-12">
              <Reveal>
                <h3 className="heading-md">{t(featuredCourse.learnTitle)}</h3>
              </Reveal>
              <RevealGroup className="mt-6 space-y-px" stagger={0.06}>
                {featuredCourse.learn.map((point) => (
                  <motion.div
                    key={point.fr}
                    variants={revealItem}
                    className="flex items-start gap-4 border-b border-ink-line py-4"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="font-body text-[0.9375rem] leading-relaxed text-cream-dim">
                      {t(point)}
                    </span>
                  </motion.div>
                ))}
              </RevealGroup>
            </div>

            {/* Price + CTA */}
            <Reveal delay={0.08}>
              <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-gold-muted/30 bg-ink-card p-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-baseline gap-2">
                    <PriceFigure
                      value={featuredCourse.price.amount}
                      className="font-latin-display text-4xl font-semibold tracking-tightest text-cream"
                    />
                    <span className="font-body text-base font-medium text-gold">
                      {t(featuredCourse.price.currency)}
                    </span>
                  </p>
                  <p className="mt-1 font-body text-xs text-cream-faint">
                    {t(featuredCourse.price.note)}
                  </p>
                </div>
                <ButtonLink href={href} variant="gold" size="lg">
                  {t(courseUi.viewCourse)}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
