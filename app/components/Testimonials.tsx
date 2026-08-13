"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { testimonialSection, testimonials } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { ArrowLeft, ArrowRight, Quote } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { Section } from "./ui/Primitives";

const AUTOPLAY_MS = 5200;

export default function Testimonials() {
  const { t, isRtl } = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /*
    The old `scrollTo({ left: card.offsetLeft - track.offsetLeft })` assumed
    LTR twice over: scrollLeft runs negative in RTL, and offsetLeft stays
    physical. Measuring both centres off getBoundingClientRect and moving by
    the difference is direction-agnostic — scrollBy's delta is always physical
    pixels — and unlike scrollIntoView it can't drag the page vertically when
    a card is taller than the viewport.
  */
  const scrollTo = useCallback((next: number) => {
    const track = trackRef.current;
    const card = track?.children[next] as HTMLElement | undefined;
    if (!track || !card) return;

    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta =
      cardRect.left + cardRect.width / 2 - (trackRect.left + trackRect.width / 2);

    track.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const next = (current + delta + testimonials.length) % testimonials.length;
        scrollTo(next);
        return next;
      });
    },
    [scrollTo]
  );

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, go]);

  // Keep the dots in sync when the user drags/swipes the track directly.
  // Viewport-relative rects, so this works identically in both directions.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const trackRect = track.getBoundingClientRect();
        const centre = trackRect.left + trackRect.width / 2;

        let closest = 0;
        let min = Infinity;
        (Array.from(track.children) as HTMLElement[]).forEach((child, i) => {
          if (i >= testimonials.length) return; // trailing spacer
          const rect = child.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - centre);
          if (distance < min) {
            min = distance;
            closest = i;
          }
        });
        setIndex(closest);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // The arrows are positional, not directional: in RTL the leading edge is on
  // the right, so the first button still has to mean "previous".
  const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <Section id="temoignages">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow mb-5">{t(testimonialSection.eyebrow)}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="heading-lg text-balance">{t(testimonialSection.title)}</h2>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="flex gap-3">
              <CarouselButton
                label={t(testimonialSection.previous)}
                onClick={() => go(-1)}
              >
                <PrevIcon className="h-4 w-4" />
              </CarouselButton>
              <CarouselButton label={t(testimonialSection.next)} onClick={() => go(1)}>
                <NextIcon className="h-4 w-4" />
              </CarouselButton>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Full-bleed track so cards bleed off the trailing edge. */}
      <div
        ref={trackRef}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-6 md:px-10 lg:px-14"
      >
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.name.fr}
            className="flex w-[85vw] shrink-0 snap-center flex-col justify-between rounded-2xl border border-ink-line bg-ink-card p-8 sm:w-[60vw] lg:w-[30rem]"
          >
            <Quote className="h-7 w-7 text-gold-muted/40 rtl:-scale-x-100" />
            <blockquote className="mt-6 font-display text-xl font-medium leading-snug tracking-tight text-cream md:text-2xl">
              « {t(testimonial.quote)} »
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-ink-line pt-6">
              <div className="relative h-11 w-11 overflow-hidden rounded-full">
                <Image
                  src={testimonial.avatar}
                  alt={t(testimonial.name)}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-cream">
                  {t(testimonial.name)}
                </p>
                <p className="font-body text-xs text-cream-faint">{t(testimonial.role)}</p>
              </div>
            </figcaption>
          </figure>
        ))}
        {/* Spacer so the last card can snap fully into view. */}
        <div aria-hidden className="w-6 shrink-0 md:w-10 lg:w-14" />
      </div>

      <div className="shell mt-8 flex gap-2">
        {testimonials.map((testimonial, i) => (
          <button
            key={testimonial.name.fr}
            type="button"
            aria-label={`${t(testimonialSection.slide)} ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => {
              setIndex(i);
              scrollTo(i);
            }}
            className={`h-1 rounded-full transition-all duration-500 ease-cinema ${
              i === index ? "w-8 bg-gold" : "w-3 bg-ink-line hover:bg-cream-faint"
            }`}
          />
        ))}
      </div>
    </Section>
  );
}

function CarouselButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-cream-dim transition-colors duration-300 ease-cinema hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  );
}
