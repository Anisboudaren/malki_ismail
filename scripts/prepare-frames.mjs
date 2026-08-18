/**
 * Builds the hero scroll sequence.
 *
 *   npm run frames
 *
 * Reads every image in the source folder declared in sequence.config.json,
 * evenly samples it down to the desktop and mobile frame counts, resizes and
 * re-encodes to WebP, and writes the results into /public.
 *
 * The source folder is produced by `npm run frames:extract`. To swap in a new
 * clip, point "videoSource" at it and run both scripts in order, then
 * `npm run frames:upload` so production reads the new files from Vercel Blob.
 */

import { readFileSync, mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "sequence.config.json"), "utf8"));

const IMAGE_EXT = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

function listFrames(folder) {
  const dir = join(root, folder);
  if (!existsSync(dir)) {
    throw new Error(`Source folder not found: ${dir}`);
  }
  return readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()))
    // Natural sort so frame_10 lands after frame_9.
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(dir, f));
}

/** Evenly pick `count` items across the whole list, always keeping first + last. */
function sample(list, count) {
  if (count >= list.length) return list;
  const step = (list.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => list[Math.round(i * step)]);
}

/**
 * Largest region of `aspect` (width / height) that fits inside the source.
 *
 * The hero canvas paints with cover geometry, so any frame wider than the
 * viewport gets its sides thrown away at runtime. Cropping to roughly the
 * viewport shape up front means the bytes we spend are bytes the user sees:
 * a landscape frame on a tall phone wastes about three quarters of them.
 *
 * `anchor` slides the window horizontally, 0 = left edge, 1 = right edge.
 */
function cropRegion({ width, height }, { aspect, anchor = 0.5 }) {
  let w = Math.round(height * aspect);
  let h = height;
  if (w > width) {
    w = width;
    h = Math.round(width / aspect);
  }
  return {
    left: Math.min(width - w, Math.max(0, Math.round((width - w) * anchor))),
    top: Math.max(0, Math.round((height - h) / 2)),
    width: w,
    height: h,
  };
}

async function buildVariant(sourceFrames, variant, name) {
  const outDir = join(root, "public", variant.dir);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const picked = sample(sourceFrames, variant.frames);
  const crop = variant.crop
    ? cropRegion(await sharp(picked[0]).metadata(), variant.crop)
    : null;
  let bytes = 0;

  for (let i = 0; i < picked.length; i++) {
    const target = join(outDir, `frame_${String(i + 1).padStart(4, "0")}.webp`);
    let pipeline = sharp(picked[i]);
    if (crop) pipeline = pipeline.extract(crop);
    const info = await pipeline
      .resize({ width: variant.width, withoutEnlargement: true })
      .webp({ quality: variant.quality, effort: 5 })
      .toFile(target);
    bytes += info.size;
  }

  const mb = (bytes / 1048576).toFixed(2);
  const shape = crop ? `${crop.width}x${crop.height} crop` : "full frame";
  console.log(
    `  ${name.padEnd(8)} ${String(picked.length).padStart(3)} frames  ${String(variant.width).padStart(4)}px  ${shape.padEnd(16)} ${mb} MB`
  );
}

async function buildFallback() {
  const src = join(root, config.fallbackSource);
  if (!existsSync(src)) {
    console.warn(`  ! fallback image missing: ${config.fallbackSource}`);
    return;
  }
  const out = join(root, "public", "hero-fallback.webp");
  const info = await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(out);
  console.log(`  fallback   hero-fallback.webp  ${(info.size / 1024).toFixed(0)} KB`);
}

/** Pulls single on-brand stills out of the clip so sections reuse real footage. */
async function buildStills(sourceFrames) {
  for (const still of config.stills ?? []) {
    const index = Math.min(
      sourceFrames.length - 1,
      Math.round(still.at * (sourceFrames.length - 1))
    );
    const out = join(root, "public", still.name);
    const info = await sharp(sourceFrames[index])
      .resize({ width: still.width, withoutEnlargement: true })
      .webp({ quality: still.quality })
      .toFile(out);
    console.log(`  still      ${still.name}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}

const frames = listFrames(config.source);
console.log(`\nSource: ${config.source} (${frames.length} frames)\n`);

await buildVariant(frames, config.desktop, "desktop");
await buildVariant(frames, config.mobile, "mobile");
await buildFallback();
await buildStills(frames);

console.log("\nDone.\n");
