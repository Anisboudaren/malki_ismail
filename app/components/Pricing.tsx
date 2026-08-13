"use client";

import { motion } from "framer-motion";

import { plans, pricingSection, type Plan } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { coursePath } from "@/lib/routes";
import { ArrowRight, Check } from "./ui/Icons";
import { PriceFigure } from "./ui/PriceFigure";
import { RevealGroup, revealItem } from "./ui/Reveal";
import { ButtonLink, Section, SectionHeader } from "./ui/Primitives";

export default function Pricing() {
  const { t } = useT();

  return (
    <Section id="tarifs" tone="soft">
      <div className="shell">
        <SectionHeader
          eyebrow={t(pricingSection.eyebrow)}
          title={t(pricingSection.title)}
          body={t(pricingSection.body)}
          align="center"
        />

        <RevealGroup className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </RevealGroup>

        {/* TODO(content): confirm the guarantee wording with the client. */}
        <p className="mt-10 text-center font-body text-xs text-cream-faint">
          {t(pricingSection.guarantee)}
        </p>
      </div>
    </Section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const { t, locale } = useT();
  const href = plan.courseSlug
    ? coursePath(locale, plan.courseSlug)
    : (plan.ctaHref ?? "#contact");

  return (
    <motion.div
      variants={revealItem}
      className={`relative flex flex-col rounded-2xl border p-8 ${
        plan.featured
          ? "border-gold-muted/60 bg-ink-card shadow-[0_0_80px_-30px_rgba(255,185,6,0.35)]"
          : "border-ink-line bg-ink"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 start-8 rounded-full bg-gold px-3 py-1 font-body text-[0.625rem] font-semibold uppercase tracking-widest text-ink">
          {t(pricingSection.featuredBadge)}
        </span>
      )}

      <h3 className="font-display text-xl font-semibold tracking-tight text-cream">
        {t(plan.name)}
      </h3>
      <p className="mt-2 font-body text-sm text-cream-dim">{t(plan.description)}</p>

      {/* Flex order reverses in RTL, which lands the currency after the figure
          in reading order in both languages. */}
      <div className="mt-7 flex items-baseline gap-2">
        <PriceFigure
          value={plan.price}
          hidden={plan.hidePrice}
          className="font-latin-display text-5xl font-semibold tracking-tightest text-cream"
        />
        <span className="font-body text-lg font-medium text-gold">
          {t(plan.currency)}
        </span>
        {/* A struck-through mask says nothing, so the old price waits for the
            real figures rather than becoming a second row of hashes. */}
        {plan.strikePrice && !plan.hidePrice && (
          <span className="ms-1 font-body text-sm text-cream-faint line-through">
            <span className="bidi-ltr">{plan.strikePrice}</span> {t(plan.currency)}
          </span>
        )}
      </div>
      <p className="mt-1.5 font-body text-xs text-cream-faint">{t(plan.note)}</p>

      <ul className="mt-8 flex-1 space-y-3.5">
        {plan.features.map((feature) => (
          <li key={feature.fr} className="flex items-start gap-3">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.featured ? "text-gold" : "text-gold-muted"
              }`}
            />
            <span className="font-body text-sm leading-relaxed text-cream-dim">
              {t(feature)}
            </span>
          </li>
        ))}
      </ul>

      <ButtonLink
        href={href}
        variant={plan.featured ? "gold" : "outline"}
        size="lg"
        className="mt-9 w-full"
      >
        {t(plan.cta)}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </ButtonLink>
    </motion.div>
  );
}
