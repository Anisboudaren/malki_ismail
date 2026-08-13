"use client";

import { useEffect, useRef, useState } from "react";
import { frameCount, frameSrc, type SequenceVariant } from "./sequence";

/** Parallel requests. Low enough that early frames land first, high enough to saturate. */
const CONCURRENCY = 8;

/** Never trap the user behind a stalled image. */
const MAX_WAIT_MS = 10_000;

export interface FrameSequence {
  /** Sparse array — index i is undefined until that frame has decoded. */
  frames: (HTMLImageElement | undefined)[];
  count: number;
  progress: number;
  ready: boolean;
}

/**
 * Preloads a whole frame sequence in order, reporting progress 0→1.
 * Pass `null` to skip loading entirely (static mode).
 */
export function useFrameSequence(variant: SequenceVariant | null): FrameSequence {
  const count = variant ? frameCount(variant) : 0;
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!variant) return;

    let cancelled = false;
    const total = frameCount(variant);
    // Mutate in place so consumers holding the array reference never go stale.
    framesRef.current.length = 0;
    framesRef.current.length = total;
    setProgress(0);
    setReady(false);

    let loaded = 0;
    let cursor = 0;
    let lastReported = -1;

    const timeout = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, MAX_WAIT_MS);

    const loadNext = (): Promise<void> => {
      const index = cursor++;
      if (index >= total || cancelled) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const img = new Image();
        // A decode failure must not stall the sequence; we just skip that frame.
        const done = () => {
          if (cancelled) return resolve();
          loaded++;
          // Re-render only when the visible percentage actually moves.
          const pct = Math.floor((loaded / total) * 100);
          if (pct !== lastReported) {
            lastReported = pct;
            setProgress(loaded / total);
          }
          resolve();
        };
        img.onload = () => {
          framesRef.current[index] = img;
          done();
        };
        img.onerror = done;
        img.decoding = "async";
        img.src = frameSrc(variant, index);
      }).then(loadNext);
    };

    Promise.all(Array.from({ length: CONCURRENCY }, loadNext)).then(() => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      setReady(true);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [variant]);

  return { frames: framesRef.current, count, progress, ready };
}
