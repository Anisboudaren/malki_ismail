"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { categorySection, type Category } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { categoryPath } from "@/lib/routes";
import { ArrowRight, Lock } from "./ui/Icons";
import { RevealGroup, revealItem } from "./ui/Reveal";
import { Section, SectionHeader } from "./ui/Primitives";

/** `motion.a` would do a full page load; this keeps client-side navigation. */
const MotionLink = motion.create(Link);

export default function CategoryStrip({ categories }: { categories: Category[] }) {
  const { t } = useT();

  return (
    <Section id="categories">
      <div className="shell">
        <SectionHeader
          eyebrow={t(categorySection.eyebrow)}
          title={t(categorySection.title)}
          body={t(categorySection.body)}
        />

        {/* Horizontal snap-scroll on small screens, grid from lg up. */}
        <RevealGroup className="no-scrollbar -mx-6 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 md:-mx-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const { t, alt, altLang, locale } = useT();
  // Locked is a design statement — it has nothing behind it yet. "Soon"
  // categories still get a page, so visitors can see what is coming.
  const isLive = category.status === "live";
  const hasPage = category.status !== "locked";
  const Wrapper = hasPage ? MotionLink : motion.div;

  return (
    <Wrapper
      variants={revealItem}
      {...(hasPage ? { href: categoryPath(locale, category.id) } : {})}
      className={`group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl border sm:w-[46vw] lg:w-auto ${
        hasPage
          ? "cursor-pointer border-ink-line hover:border-gold-muted/60"
          : "border-ink-line/70"
      } bg-ink-card transition-colors duration-500 ease-cinema`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={category.image}
          alt={t(category.title)}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 22vw"
          className={`object-cover transition-all duration-[900ms] ease-cinema ${
            isLive
              ? "opacity-70 group-hover:scale-[1.04] group-hover:opacity-95"
              : "opacity-25 grayscale"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />

        <span
          className={`absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest ${
            isLive
              ? "bg-gold text-ink"
              : "border border-cream/15 bg-ink/70 text-cream-faint"
          }`}
        >
          {!isLive && <Lock className="h-3 w-3" />}
          {t(category.statusLabel)}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-body text-[0.625rem] uppercase tracking-ultrawide text-cream-faint">
            {t(category.courseCount)}
          </p>
          <h3
            className={`mt-2 font-display text-2xl font-semibold tracking-tight ${
              isLive ? "text-cream" : "text-cream-dim"
            }`}
          >
            {t(category.title)}
          </h3>
          {/* The other language as a support line. `lang` only, no `dir`, so it
              keeps the alignment of the heading above it — bidi still renders
              the glyphs and joins correctly either way. */}
          <p lang={altLang} className="mt-1 font-body text-sm text-cream-faint">
            {alt(category.title)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <p className="font-body text-sm leading-relaxed text-cream-dim">
          {t(category.description)}
        </p>
        {hasPage ? (
          <span
            className={`inline-flex items-center gap-2 font-body text-sm font-semibold ${
              isLive ? "text-gold" : "text-cream-faint"
            }`}
          >
            {t(isLive ? categorySection.explore : categorySection.soon)}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cinema group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </span>
        ) : (
          <span className="font-body text-sm text-cream-faint">
            {t(categorySection.soon)}
          </span>
        )}
      </div>
    </Wrapper>
  );
}
