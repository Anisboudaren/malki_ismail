"use client";

import { motion } from "framer-motion";

import { valueProps, valuePropSection } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { valuePropIcons } from "./ui/Icons";
import { RevealGroup, revealItem } from "./ui/Reveal";
import { Section, SectionHeader } from "./ui/Primitives";

export default function ValueProps() {
  const { t } = useT();

  return (
    <Section id="avantages" tone="soft">
      <div className="shell">
        <SectionHeader
          eyebrow={t(valuePropSection.eyebrow)}
          title={t(valuePropSection.title)}
          body={t(valuePropSection.body)}
          align="center"
        />

        <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop) => {
            const Icon = valuePropIcons[prop.icon];
            return (
              <motion.div
                key={prop.title.fr}
                variants={revealItem}
                className="group bg-ink p-8 transition-colors duration-500 ease-cinema hover:bg-ink-card"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-muted/30 text-gold transition-colors duration-500 ease-cinema group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-cream">
                  {t(prop.title)}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-cream-dim">
                  {t(prop.body)}
                </p>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </Section>
  );
}
