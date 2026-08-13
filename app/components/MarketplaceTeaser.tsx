"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { marketplace } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { ArrowRight, Lock } from "./ui/Icons";
import { Reveal, RevealGroup, revealItem } from "./ui/Reveal";
import { ButtonLink } from "./ui/Primitives";

export default function MarketplaceTeaser() {
  const { t } = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Gentle parallax on the backdrop — nothing that draws attention to itself.
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="academie"
      ref={ref}
      className="relative isolate scroll-mt-24 overflow-hidden border-y border-ink-line bg-ink"
    >
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src={marketplace.image}
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </motion.div>
      {/* Blends the backdrop into the neighbouring sections top and bottom. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink"
      />
      {/* Keeps the left-hand copy readable over the backdrop. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent rtl:bg-gradient-to-l"
      />
      <div aria-hidden className="film-grain absolute inset-0" />

      <div className="relative z-10 shell py-28 md:py-36 lg:py-44">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <Reveal>
              <p className="eyebrow mb-5">{t(marketplace.eyebrow)}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="heading-lg max-w-xl text-balance">
                {t(marketplace.title)}
              </h2>
            </Reveal>
            <div className="mt-8 space-y-5">
              {marketplace.body.map((paragraph, i) => (
                <Reveal key={paragraph.fr} delay={0.12 + i * 0.06}>
                  <p className="body-lg max-w-xl text-pretty">{t(paragraph)}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.24}>
              <ButtonLink href={marketplace.cta.href} variant="outline" className="mt-10">
                {t(marketplace.cta.label)}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </ButtonLink>
            </Reveal>
          </div>

          {/* Empty seats waiting for the next teachers to sign. */}
          <RevealGroup className="space-y-4 lg:pt-4">
            {marketplace.upcoming.map((slot) => (
              <motion.div
                key={slot.name.fr}
                variants={revealItem}
                className="flex items-center gap-5 rounded-2xl border border-dashed border-ink-line bg-ink/50 p-6 backdrop-blur-sm"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink-line text-cream-faint">
                  <Lock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-medium tracking-tight text-cream-dim">
                    {t(slot.name)}
                  </p>
                  <p className="font-body text-sm text-cream-faint">
                    {t(slot.discipline)}
                  </p>
                </div>
                <span className="shrink-0 font-latin text-xs uppercase tracking-[0.28em] text-gold-muted">
                  {slot.eta}
                </span>
              </motion.div>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
