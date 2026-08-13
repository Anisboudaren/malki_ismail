"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { hero } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { sequence, type SequenceVariant } from "@/lib/sequence";
import { useFrameSequence } from "@/lib/useFrameSequence";
import { useSequenceMode } from "@/lib/useSequenceMode";
import { ArrowDown, ArrowRight } from "./ui/Icons";

/** How much scroll distance the pinned sequence gets. Taller = slower scrub. */
const SCROLL_HEIGHT = { desktop: "400vh", mobile: "260vh" } as const;

export default function Hero() {
  const mode = useSequenceMode();
  const isStatic = mode === null || mode === "static";

  return isStatic ? <StaticHero /> : <ScrubHero variant={mode} />;
}

/* -------------------------------------------------------------------------- */
/* Scroll-scrubbed canvas hero                                                 */
/* -------------------------------------------------------------------------- */

function ScrubHero({ variant }: { variant: SequenceVariant }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { frames, count, progress, ready } = useFrameSequence(variant);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* -- Canvas painting -------------------------------------------------- */

  const targetFrame = useRef(0);
  const drawnFrame = useRef(-1);
  const rafId = useRef<number | null>(null);
  const framesRef = useRef(frames);
  framesRef.current = frames;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    /** Paint `index` using object-fit: cover geometry. */
    const paint = (index: number) => {
      const img = framesRef.current[index];
      if (!img) return false;

      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      return true;
    };

    /** Nearest decoded frame, so gaps during preload never blank the canvas. */
    const paintNearest = (index: number) => {
      if (paint(index)) return index;
      for (let offset = 1; offset < count; offset++) {
        if (paint(index - offset)) return index - offset;
        if (paint(index + offset)) return index + offset;
      }
      return -1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawnFrame.current = -1;
      paintNearest(targetFrame.current);
    };

    const tick = () => {
      if (drawnFrame.current !== targetFrame.current) {
        const painted = paintNearest(targetFrame.current);
        if (painted === targetFrame.current) drawnFrame.current = painted;
      }
      rafId.current = requestAnimationFrame(tick);
    };

    resize();
    rafId.current = requestAnimationFrame(tick);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [count]);

  // Scroll progress → frame index. The rAF loop above does the actual drawing.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    targetFrame.current = Math.min(count - 1, Math.max(0, Math.round(value * (count - 1))));
  });

  /* -- Lock scrolling until the sequence is buffered --------------------- */

  useEffect(() => {
    if (ready) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [ready]);

  /* -- Overlay timings --------------------------------------------------- */

  const headline = useCheckpoint(scrollYProgress, hero.headline.at);
  const sub = useCheckpoint(scrollYProgress, hero.subheadline.at);

  const closingOpacity = useTransform(scrollYProgress, [...hero.closing.at.in], [0, 1]);
  const closingY = useTransform(scrollYProgress, [...hero.closing.at.in], [40, 0]);

  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const vignette = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.7, 0.85]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative"
      style={{ height: SCROLL_HEIGHT[variant] }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        {/* Poster sits under the canvas so nothing flashes before the first paint. */}
        <Image
          src={sequence.fallbackSrc}
          alt=""
          fill
          priority
          aria-hidden
          className="object-cover"
        />

        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />

        {/* Cinematic grade: darkened edges + bottom blend into the page. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: vignette }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_20%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.9)_100%)]" />
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink via-ink/60 to-transparent"
        />
        {/* Side scrim so overlay copy stays legible over bright frames. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-transparent rtl:bg-gradient-to-l"
        />
        <div aria-hidden className="film-grain pointer-events-none absolute inset-0" />

        <HeroOverlay
          headline={headline}
          sub={sub}
          closingOpacity={closingOpacity}
          closingY={closingY}
          hintOpacity={hintOpacity}
        />

        {!ready && <SequenceLoader progress={progress} />}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Overlay text                                                                */
/* -------------------------------------------------------------------------- */

interface Checkpoint {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}

/**
 * Fades a block in over `in` (when present), holds it, then fades it out over
 * `out`. Omitting `in` means the block starts visible at progress 0.
 */
function useCheckpoint(
  scroll: MotionValue<number>,
  at: { in?: readonly [number, number]; out: readonly [number, number] }
): Checkpoint {
  const stops = at.in
    ? [at.in[0], at.in[1], at.out[0], at.out[1]]
    : [0, at.out[0], at.out[1]];
  const opacities = at.in ? [0, 1, 1, 0] : [1, 1, 0];
  const offsets = at.in ? [36, 0, 0, -28] : [0, 0, -28];

  return {
    opacity: useTransform(scroll, stops, opacities),
    y: useTransform(scroll, stops, offsets),
  };
}

function HeroOverlay({
  headline,
  sub,
  closingOpacity,
  closingY,
  hintOpacity,
}: {
  headline: Checkpoint;
  sub: Checkpoint;
  closingOpacity: MotionValue<number>;
  closingY: MotionValue<number>;
  hintOpacity: MotionValue<number>;
}) {
  const { t } = useT();

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* All three blocks share one grid cell so they cross-fade in place. */}
      <div className="shell relative grid h-full grid-cols-1 grid-rows-1 items-center">
        {/* Headline */}
        <motion.div
          style={{ opacity: headline.opacity, y: headline.y }}
          className="col-start-1 row-start-1 self-center"
        >
          {/* Nested so the mount animation and the scroll fade-out compose. */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <p className="eyebrow mb-5">{t(hero.eyebrow)}</p>
            <h1 className="heading-xl max-w-4xl text-balance">
              {t(hero.headline.lead)}
              <br />
              <span className="text-gold-muted">{t(hero.headline.accent)}</span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          style={{ opacity: sub.opacity, y: sub.y }}
          className="body-lg col-start-1 row-start-1 max-w-2xl self-center text-pretty text-xl leading-snug text-cream md:text-3xl"
        >
          {t(hero.subheadline.text)}
        </motion.p>

        {/* Closing CTA */}
        <motion.div
          style={{ opacity: closingOpacity, y: closingY }}
          className="pointer-events-auto col-start-1 row-start-1 self-center"
        >
          <h2 className="heading-lg mb-8 whitespace-pre-line text-balance">
            {t(hero.closing.title)}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.closing.primary.href}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 font-body text-sm font-semibold text-ink transition-colors duration-300 ease-cinema hover:bg-cream"
            >
              {t(hero.closing.primary.label)}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cinema group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </a>
            <a
              href={hero.closing.secondary.href}
              className="inline-flex items-center justify-center rounded-full border border-cream/25 px-7 py-3.5 font-body text-sm font-medium text-cream transition-colors duration-300 ease-cinema hover:border-cream/60"
            >
              {t(hero.closing.secondary.label)}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[0.625rem] uppercase tracking-ultrawide text-cream-faint">
          {t(hero.scrollHint)}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce text-gold-muted" />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loader                                                                      */
/* -------------------------------------------------------------------------- */

function SequenceLoader({ progress }: { progress: number }) {
  const { t } = useT();
  const pct = Math.round(progress * 100);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-ink/85 backdrop-blur-sm">
      <span className="font-body text-[0.625rem] uppercase tracking-ultrawide text-cream-faint">
        {t(hero.loadingLabel)}
      </span>
      <div className="h-px w-56 overflow-hidden bg-ink-line">
        <div
          className="h-full bg-gold transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className="font-latin-display text-4xl font-semibold tabular-nums tracking-tightest text-cream"
        aria-live="polite"
        dir="ltr"
      >
        {pct}%
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Static hero — reduced motion, slow networks, and the SSR pass               */
/* -------------------------------------------------------------------------- */

function StaticHero() {
  const { t } = useT();

  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink">
      <Image
        src={sequence.fallbackSrc}
        alt=""
        fill
        priority
        aria-hidden
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,transparent_20%,rgba(0,0,0,0.6)_70%,rgba(0,0,0,0.92)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink via-ink/60 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-transparent rtl:bg-gradient-to-l"
      />
      <div aria-hidden className="film-grain absolute inset-0" />

      <div className="shell relative flex h-full flex-col justify-center">
        <p className="eyebrow mb-5 animate-fade-up">{t(hero.eyebrow)}</p>
        <h1
          className="heading-xl max-w-4xl text-balance animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          {t(hero.headline.lead)}
          <br />
          <span className="text-gold-muted">{t(hero.headline.accent)}</span>
        </h1>
        <p
          className="body-lg mt-7 max-w-xl text-pretty animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {t(hero.subheadline.text)}
        </p>
        <div
          className="mt-10 flex flex-col gap-3 animate-fade-up sm:flex-row sm:items-center"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href={hero.closing.primary.href}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 font-body text-sm font-semibold text-ink transition-colors duration-300 ease-cinema hover:bg-cream"
          >
            {t(hero.closing.primary.label)}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cinema group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </a>
          <a
            href={hero.closing.secondary.href}
            className="inline-flex items-center justify-center rounded-full border border-cream/25 px-7 py-3.5 font-body text-sm font-medium text-cream transition-colors duration-300 ease-cinema hover:border-cream/60"
          >
            {t(hero.closing.secondary.label)}
          </a>
        </div>
      </div>
    </section>
  );
}
