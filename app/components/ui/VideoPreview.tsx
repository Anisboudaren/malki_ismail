"use client";

import Image from "next/image";
import { useState } from "react";

import { LessonPlayer } from "@/app/components/dashboard/LessonPlayer";
import { Play } from "./Icons";

export function VideoPreview({
  src,
  poster,
  label,
  posterAlt,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  posterAlt: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-ink-line bg-ink-card ${className}`}
      dir="ltr"
    >
      {playing ? (
        <LessonPlayer src={src} title={label} autoPlay fill />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="group absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold"
        >
          <Image
            src={poster}
            alt={posterAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />

          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-gold/95 text-ink shadow-[0_0_60px_-10px_rgba(255,185,6,0.7)] transition-transform duration-300 ease-cinema group-hover:scale-110">
              <Play className="h-6 w-6 translate-x-[2px]" />
            </span>
          </span>

          <span className="absolute inset-x-0 bottom-0 p-5 text-start font-body text-sm font-medium text-cream">
            {label}
          </span>
        </button>
      )}
    </div>
  );
}
