"use client";

import { motion, useReducedMotion } from "framer-motion";

import { hiddenPriceLabel, revealPrices } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";

/** Keeps the separators so the masked figure holds the real one's width. */
const maskOf = (value: string) => value.replace(/\d/g, "#");

/**
 * A price amount — either the real figure or an animated `#` placeholder.
 * Pass `hidden` to mask a single figure; `revealPrices` in content.ts is the
 * global override that can mask every price at once.
 *
 * Either way the figure is its own LTR run. A thousands space is a neutral
 * character between two digit groups, and the bidi algorithm resolves such
 * neutrals to RTL (it treats European numbers as right-to-left for that
 * purpose), so an un-isolated `40 000` renders as `000 40` on /ar.
 */
export function PriceFigure({
  value,
  hidden = false,
  className = "",
}: {
  value: string;
  hidden?: boolean;
  className?: string;
}) {
  const { t } = useT();
  const reducedMotion = useReducedMotion();

  if (revealPrices && !hidden) {
    return <span className={`bidi-ltr ${className}`}>{value}</span>;
  }

  return (
    <span className={`bidi-ltr ${className}`}>
      <span className="sr-only">{t(hiddenPriceLabel)}</span>
      <span aria-hidden className="text-gold-muted">
        {maskOf(value)
          .split("")
          .map((char, i) =>
            char === " " ? (
              <span key={i} className="inline-block w-[0.28em]" />
            ) : (
              <motion.span
                key={i}
                className="inline-block"
                animate={
                  reducedMotion
                    ? { opacity: 0.7 }
                    : { opacity: [0.3, 0.95, 0.3] }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  // Staggered so the pulse reads as a sweep across the figure
                  // rather than the whole thing blinking at once.
                  delay: i * 0.16,
                }}
              >
                {char}
              </motion.span>
            ),
          )}
      </span>
    </span>
  );
}
