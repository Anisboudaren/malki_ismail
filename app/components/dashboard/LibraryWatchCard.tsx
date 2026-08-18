"use client";

import { useState } from "react";
import { LessonPlayer } from "@/app/components/dashboard/LessonPlayer";

export function LibraryWatchCard({
  title,
  filename,
  url,
  thumbnailUrl,
  publitioId,
}: {
  title: string;
  filename: string;
  url: string;
  thumbnailUrl?: string | null;
  publitioId?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const playable = Boolean(url || publitioId);

  return (
    <li className="overflow-hidden rounded-2xl border border-ink-line bg-ink-card">
      <div className="relative aspect-video w-full bg-ink" dir="ltr">
        {playing && playable ? (
          <LessonPlayer
            src={url}
            publitioId={publitioId}
            title={title}
            autoPlay
            fill
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (playable) setPlaying(true);
            }}
            disabled={!playable}
            className="group relative block h-full w-full overflow-hidden bg-ink-soft"
            aria-label={playable ? `Lire ${title || filename}` : title || filename}
          >
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 bg-ink" />
            )}
            <span className="absolute inset-0 grid place-items-center bg-ink/35">
              <span className="rounded-full bg-gold px-4 py-2 font-body text-sm font-medium text-ink">
                {playable ? "Lire" : "Indisponible"}
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-body text-sm">{title || filename}</p>
        <p className="truncate font-body text-xs text-cream-faint" dir="ltr">
          {filename}
        </p>
      </div>
    </li>
  );
}
