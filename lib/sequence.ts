import config from "@/sequence.config.json";

export type SequenceVariant = "desktop" | "mobile";

/** "static" = no scrub at all, just the poster image (slow network / reduced motion). */
export type SequenceMode = SequenceVariant | "static";

export const sequence = {
  aspectRatio: config.aspectRatio,
  fallbackSrc: "/hero-fallback.webp",
  desktop: { dir: config.desktop.dir, count: config.desktop.frames },
  mobile: { dir: config.mobile.dir, count: config.mobile.frames },
} as const;

export function frameSrc(variant: SequenceVariant, index: number): string {
  const { dir } = sequence[variant];
  return `/${dir}/frame_${String(index + 1).padStart(4, "0")}.webp`;
}

export function frameCount(variant: SequenceVariant): number {
  return sequence[variant].count;
}
