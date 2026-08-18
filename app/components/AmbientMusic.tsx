"use client";

import { useEffect, useRef, useState } from "react";

import { ambientMusic } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { Speaker, SpeakerOff } from "./ui/Icons";

/**
 * Homepage ambience via YouTube's embed player — the file is not downloaded
 * or rehosted. Track: https://www.youtube.com/watch?v=30jrmzzgHLc
 */
const VIDEO_ID = "30jrmzzgHLc";
const START_AT = 17;
const VOLUME = 14;

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (n: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          host?: string;
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi(): Promise<NonNullable<Window["YT"]>> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export default function AmbientMusic() {
  const { t } = useT();
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let removeUnlock: (() => void) | undefined;

    const apply = (target: YTPlayer) => {
      target.setVolume(VOLUME);
      if (target.getCurrentTime() < START_AT - 0.4) {
        target.seekTo(START_AT, true);
      }
      if (mutedRef.current) target.mute();
      else target.unMute();
      target.playVideo();
    };

    loadApi().then((YT) => {
      if (cancelled || !hostRef.current) return;

      const player = new YT.Player(hostRef.current, {
        host: "https://www.youtube-nocookie.com",
        videoId: VIDEO_ID,
        width: 200,
        height: 200,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          start: START_AT,
          loop: 1,
          playlist: VIDEO_ID,
          mute: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            apply(event.target);

            // Unmuted autoplay is often blocked; the first tap/scroll retries
            // with sound unless the visitor already muted.
            const unlockBrowse = (event: Event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("[data-ambient-toggle]")
              ) {
                return;
              }
              if (mutedRef.current || !playerRef.current) return;
              apply(playerRef.current);
            };

            window.addEventListener("pointerdown", unlockBrowse, { passive: true });
            window.addEventListener("scroll", unlockBrowse, { passive: true });
            removeUnlock = () => {
              window.removeEventListener("pointerdown", unlockBrowse);
              window.removeEventListener("scroll", unlockBrowse);
            };
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              event.target.seekTo(START_AT, true);
              event.target.playVideo();
              return;
            }
            if (event.data === YT.PlayerState.PLAYING) {
              event.target.setVolume(VOLUME);
              if (event.target.getCurrentTime() < START_AT - 0.4) {
                event.target.seekTo(START_AT, true);
              }
              if (mutedRef.current) event.target.mute();
            }
          },
        },
      });
      playerRef.current = player;
    });

    const onVisibility = () => {
      const current = playerRef.current;
      if (!current || mutedRef.current) return;
      if (document.hidden) current.pauseVideo();
      else apply(current);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      removeUnlock?.();
      document.removeEventListener("visibilitychange", onVisibility);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const toggle = () => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(VOLUME);
    if (next) {
      player.mute();
      return;
    }
    player.unMute();
    player.playVideo();
  };

  return (
    <>
      <div
        className="pointer-events-none fixed -left-[240px] -top-[240px] h-[200px] w-[200px] overflow-hidden opacity-0"
        aria-hidden
      >
        <div ref={hostRef} />
      </div>

      <button
        type="button"
        data-ambient-toggle
        onClick={toggle}
        aria-pressed={!muted}
        aria-label={t(muted ? ambientMusic.unmute : ambientMusic.mute)}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] start-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-cream/20 bg-ink/70 text-cream shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors duration-300 ease-cinema hover:border-gold-muted/70 hover:text-gold md:start-7"
      >
        {muted ? <SpeakerOff className="h-5 w-5" /> : <Speaker className="h-5 w-5" />}
      </button>
    </>
  );
}
