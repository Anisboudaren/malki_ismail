import config from "@/sequence.config.json";

export type SequenceVariant = "desktop" | "mobile";

/** "static" = no scrub at all, just the poster image (slow network / reduced motion). */
export type SequenceMode = SequenceVariant | "static";

const blobBase = (
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  config.blobBaseUrl ||
  ""
).replace(/\/$/, "");

/** Public CDN URL for generated media (frames, stills, hero video). */
export function mediaUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  if (blobBase) return `${blobBase}/${clean}`;
  return `/${clean}`;
}

export const sequence = {
  aspectRatio: config.aspectRatio,
  fallbackSrc: mediaUrl("hero-fallback.webp"),
  heroVideoSrc: mediaUrl("video/hero.mp4"),
  desktop: { dir: config.desktop.dir, count: config.desktop.frames },
  mobile: { dir: config.mobile.dir, count: config.mobile.frames },
} as const;

export function frameSrc(variant: SequenceVariant, index: number): string {
  const { dir } = sequence[variant];
  return mediaUrl(`${dir}/frame_${String(index + 1).padStart(4, "0")}.webp`);
}

export function frameCount(variant: SequenceVariant): number {
  return sequence[variant].count;
}
