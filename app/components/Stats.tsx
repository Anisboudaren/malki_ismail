"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

import { stats, type Stat } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";

export default function Stats() {
  return (
    <section className="relative border-y border-ink-line bg-ink-soft">
      <div className="shell grid grid-cols-2 gap-y-12 py-16 md:py-20 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatItem key={stat.label.fr} stat={stat} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ stat }: { stat: Stat }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const decimals = stat.decimals ?? 0;
  const [value, setValue] = useState(() => (0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, stat.value, {
      duration: 1.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, stat.value, decimals]);

  return (
    <div ref={ref} className="border-s border-ink-line ps-6 lg:ps-10">
      <p className="font-latin-display text-5xl font-semibold tabular-nums tracking-tightest text-cream md:text-6xl lg:text-7xl">
        {/* Algeria uses Western digits, but `4.9/5` and `24/7` get reordered by
            bidi in RTL, so the figure is isolated as its own LTR run. */}
        <span className="bidi-ltr">
          {value}
          <span className="text-gold">{stat.suffix}</span>
        </span>
      </p>
      <p className="mt-3 font-body text-xs uppercase tracking-ultrawide text-cream-faint">
        {t(stat.label)}
      </p>
    </div>
  );
}
