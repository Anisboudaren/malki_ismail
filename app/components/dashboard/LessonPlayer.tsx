"use client";

import { useEffect, useRef } from "react";

import { isHlsSrc, publitioPlayerSrc } from "@/lib/video-src";

export function PlayerFrame({
  children,
  className = "",
  fill = false,
}: {
  children: React.ReactNode;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      dir="ltr"
      className={
        fill
          ? `absolute inset-0 overflow-hidden bg-black ${className}`
          : `relative w-full overflow-hidden bg-black ${className}`
      }
    >
      {fill ? null : <span className="block w-full pt-[56.25%]" aria-hidden />}
      {children}
    </div>
  );
}

export function LessonPlayer({
  src,
  title,
  className = "",
  autoPlay = false,
  fill = false,
  publitioId,
}: {
  src: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  fill?: boolean;
  publitioId?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const embedSrc = publitioPlayerSrc(src, publitioId);
  const hlsSrc = !embedSrc && isHlsSrc(src) ? src : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || embedSrc) return;

    let cancelled = false;
    let hls: { destroy: () => void } | null = null;

    const tryPlay = () => {
      if (!autoPlay) return;
      void video.play().catch(() => undefined);
    };

    (async () => {
      if (hlsSrc) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsSrc;
          tryPlay();
          return;
        }
        const { default: Hls } = await import("hls.js");
        if (cancelled || !Hls.isSupported()) return;
        const instance = new Hls({
          enableWorker: false,
          capLevelToPlayerSize: true,
        });
        instance.on(Hls.Events.MANIFEST_PARSED, () => {
          tryPlay();
        });
        instance.loadSource(hlsSrc);
        instance.attachMedia(video);
        if (cancelled) {
          instance.destroy();
          return;
        }
        hls = instance;
        return;
      }

      video.src = src;
      tryPlay();
    })();

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [autoPlay, embedSrc, hlsSrc, src]);

  if (!src && !embedSrc) {
    return (
      <PlayerFrame fill={fill} className={`${className} grid place-items-center`}>
        <p className="px-4 text-center font-body text-sm text-cream-dim">Vidéo indisponible.</p>
      </PlayerFrame>
    );
  }

  if (embedSrc) {
    return (
      <PlayerFrame fill={fill} className={className}>
        <iframe
          src={embedSrc}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </PlayerFrame>
    );
  }

  return (
    <PlayerFrame fill={fill} className={className}>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="auto"
        controlsList="nodownload"
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    </PlayerFrame>
  );
}
