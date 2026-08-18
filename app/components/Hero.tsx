"use client";

import { useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
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
const SCROLL_HEIGHT = { desktop: "460vh", mobile: "460vh" } as const;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const SNAP_DURATION_MS = 720;
const SETTLE_MS = 130;
const STEP_THRESHOLD = 0.07;
const WHEEL_GAIN = 0.48;

function viewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function heroMetrics(section: HTMLElement) {
  const vh = viewportHeight();
  const range = section.offsetHeight - vh;
  const top = window.scrollY + section.getBoundingClientRect().top;
  const progress = range <= 0 ? 0 : Math.min(1, Math.max(0, -section.getBoundingClientRect().top / range));
  return { vh, range, top, progress };
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * iOS sticky + the collapsing URL bar lets the whole hero translate a few
 * pixels before it pins. While the section is in range we `position: fixed`
 * the stage to the visual viewport so only the frames move.
 */
function useFixedPin(
  sectionRef: RefObject<HTMLElement | null>,
  pinRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    let frame = 0;

    const viewport = () => {
      const vv = window.visualViewport;
      return {
        height: vv?.height ?? window.innerHeight,
        offsetTop: vv?.offsetTop ?? 0,
      };
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const { height: vh, offsetTop } = viewport();

      pin.style.left = "0";
      pin.style.right = "0";
      pin.style.width = "100%";
      pin.style.height = `${vh}px`;

      if (rect.top > 0) {
        pin.style.position = "absolute";
        pin.style.top = "0";
        pin.style.bottom = "auto";
      } else if (rect.bottom > vh + offsetTop) {
        pin.style.position = "fixed";
        pin.style.top = `${offsetTop}px`;
        pin.style.bottom = "auto";
      } else {
        pin.style.position = "absolute";
        pin.style.top = "auto";
        pin.style.bottom = "0";
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [sectionRef, pinRef]);
}

/** After a flick, ease one copy beat at a time — never skip, easy to reverse. */
function useHeroMagnet(
  sectionRef: RefObject<HTMLElement | null>,
  settledIndexRef: MutableRefObject<number>
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const snaps = hero.snaps;
    const last = snaps.length - 1;
    let touching = false;
    let animating = false;
    let raf = 0;
    let timer = 0;
    let originIndex = 0;
    let burst = false;
    let wheelDir = 0;

    const pinned = () => {
      const rect = section.getBoundingClientRect();
      const vh = viewportHeight();
      return rect.top <= 1 && rect.bottom > vh * 0.55;
    };

    const stopTween = () => {
      animating = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const tweenTo = (progress: number) => {
      const { range, top } = heroMetrics(section);
      const target = top + progress * Math.max(range, 0);
      const start = window.scrollY;
      const dist = target - start;
      if (Math.abs(dist) < 2) return;

      stopTween();
      animating = true;
      const t0 = performance.now();
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";

      const step = (now: number) => {
        if (!animating) {
          root.style.scrollBehavior = previous;
          return;
        }
        const t = Math.min(1, (now - t0) / SNAP_DURATION_MS);
        window.scrollTo(0, start + dist * easeOutCubic(t));
        if (t < 1) {
          raf = requestAnimationFrame(step);
          return;
        }
        raf = 0;
        animating = false;
        root.style.scrollBehavior = previous;
      };
      raf = requestAnimationFrame(step);
    };

    const settle = () => {
      if (touching || !pinned()) {
        burst = false;
        wheelDir = 0;
        return;
      }

      const { progress } = heroMetrics(section);
      const origin = originIndex;
      const delta = progress - snaps[origin];

      if (origin === last && delta > 0.08) {
        settledIndexRef.current = last;
        burst = false;
        wheelDir = 0;
        return;
      }

      let next = origin;
      if (delta > STEP_THRESHOLD) next = Math.min(last, origin + 1);
      else if (delta < -STEP_THRESHOLD) next = Math.max(0, origin - 1);

      settledIndexRef.current = next;
      burst = false;
      wheelDir = 0;
      tweenTo(snaps[next]);
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };

    const beginBurst = () => {
      if (burst) return;
      burst = true;
      originIndex = settledIndexRef.current;
    };

    const onTouchStart = () => {
      touching = true;
      stopTween();
      beginBurst();
      window.clearTimeout(timer);
    };
    const onTouchEnd = () => {
      touching = false;
      schedule();
    };

    const onWheel = (event: WheelEvent) => {
      if (!pinned()) return;

      const { range, top, progress } = heroMetrics(section);
      if (range <= 0) return;

      beginBurst();
      if (!wheelDir) wheelDir = event.deltaY === 0 ? 0 : event.deltaY > 0 ? 1 : -1;

      const origin = originIndex;
      if (origin === last && event.deltaY > 0 && progress >= snaps[last]) {
        schedule();
        return;
      }
      if (origin === 0 && event.deltaY < 0 && progress <= 0.01) return;

      event.preventDefault();
      stopTween();

      let dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 16;
      if (event.deltaMode === 2) dy *= viewportHeight();

      const toward = origin + (wheelDir || (dy > 0 ? 1 : -1));
      const neighbor = snaps[Math.max(0, Math.min(last, toward))];
      const lo = Math.min(snaps[origin], neighbor);
      const hi =
        origin === last && wheelDir > 0 ? 1 : Math.max(snaps[origin], neighbor);

      const next = Math.min(hi, Math.max(lo, progress + (dy / range) * WHEEL_GAIN));
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, top + next * range);
      root.style.scrollBehavior = previous;
      schedule();
    };

    const onScroll = () => {
      if (touching || burst || animating) return;
      if (!pinned()) return;
      beginBurst();
      schedule();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stopTween();
      window.clearTimeout(timer);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionRef, settledIndexRef]);
}

function scrollHeroTo(
  section: HTMLElement | null,
  progress: number,
  settledIndexRef?: MutableRefObject<number>
) {
  if (!section) return;
  const { range, top } = heroMetrics(section);
  const snaps = hero.snaps;
  let best = 0;
  snaps.forEach((point, index) => {
    if (Math.abs(progress - point) < Math.abs(progress - snaps[best])) best = index;
  });
  if (settledIndexRef) settledIndexRef.current = best;

  const target = top + progress * Math.max(range, 0);
  const start = window.scrollY;
  const dist = target - start;
  if (Math.abs(dist) < 2) return;

  const t0 = performance.now();
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / SNAP_DURATION_MS);
    window.scrollTo(0, start + dist * easeOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
    else root.style.scrollBehavior = previous;
  };
  requestAnimationFrame(step);
}

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
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const settledIndexRef = useRef(0);

  const { frames, count, progress, ready } = useFrameSequence(variant);
  useFixedPin(sectionRef, pinRef);
  useHeroMagnet(sectionRef, settledIndexRef);

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
      className="relative bg-ink"
      style={{ height: SCROLL_HEIGHT[variant] }}
    >
      <div
        ref={pinRef}
        className="sticky top-0 h-dvh w-full overflow-hidden bg-ink"
      >
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
          scrollProgress={scrollYProgress}
          onJump={(point) => scrollHeroTo(sectionRef.current, point, settledIndexRef)}
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
  scrollProgress,
  onJump,
}: {
  headline: Checkpoint;
  sub: Checkpoint;
  closingOpacity: MotionValue<number>;
  closingY: MotionValue<number>;
  hintOpacity: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  onJump: (progress: number) => void;
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

      {/* Beat anchors — tap to jump, magnet snap lands on the same stops. */}
      <HeroBeats progress={scrollProgress} onJump={onJump} />

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

function HeroBeats({
  progress,
  onJump,
}: {
  progress: MotionValue<number>;
  onJump: (point: number) => void;
}) {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const labels = [
    `${t(hero.headline.lead)} ${t(hero.headline.accent)}`,
    t(hero.subheadline.text),
    t(hero.closing.title).replace(/\n/g, " "),
  ];

  useMotionValueEvent(progress, "change", (value) => {
    let best = 0;
    hero.snaps.forEach((point, index) => {
      if (Math.abs(value - point) < Math.abs(value - hero.snaps[best])) best = index;
    });
    setActive((prev) => (prev === best ? prev : best));
  });

  return (
    <div
      className="pointer-events-auto absolute inset-y-0 end-3 z-10 flex flex-col justify-center md:end-6"
      role="navigation"
      aria-label={t(hero.scrollHint)}
    >
      {hero.snaps.map((point, index) => {
        const current = index === active;
        return (
          <button
            key={point}
            type="button"
            aria-label={labels[index]}
            aria-current={current ? "true" : undefined}
            onClick={() => onJump(point)}
            className="grid h-8 w-8 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span
              className={`block rounded-full transition-[width,height,background-color] duration-300 ease-cinema ${
                current ? "h-2.5 w-2.5 bg-gold" : "h-1.5 w-1.5 bg-cream/35"
              }`}
            />
          </button>
        );
      })}
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
