/**
 * Extracts the hero clip into lossless frames.
 *
 *   npm run frames:extract
 *
 * Decodes every frame of the video declared as "videoSource" in
 * sequence.config.json straight to PNG, at native resolution and native frame
 * rate, into the "source" folder that prepare-frames.mjs reads.
 *
 * PNG rather than JPG/WebP on purpose: this folder is a build input, so the
 * only lossy step in the whole pipeline should be the final WebP encode. The
 * folder is gitignored and safe to delete — re-run this to rebuild it.
 *
 * Requires ffmpeg on PATH.
 */

import { readFileSync, mkdirSync, rmSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(join(root, "sequence.config.json"), "utf8"));

if (!config.videoSource) {
  throw new Error('sequence.config.json is missing "videoSource".');
}

const video = join(root, config.videoSource);
if (!existsSync(video)) {
  throw new Error(`Video not found: ${video}`);
}

if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).error) {
  throw new Error("ffmpeg not found on PATH. Install it, then re-run.");
}

const outDir = join(root, config.source);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

console.log(`\nExtracting ${config.videoSource} -> ${config.source}\n`);

// -fps_mode passthrough keeps the clip's own frame timing. Resampling to a
// different fps (as an online GIF converter would) duplicates frames and makes
// the scrub judder once prepare-frames samples it back down.
const result = spawnSync(
  "ffmpeg",
  [
    "-v", "error",
    "-i", video,
    "-fps_mode", "passthrough",
    "-pix_fmt", "rgb24",
    join(outDir, "frame_%04d.png"),
  ],
  { stdio: "inherit" }
);

if (result.status !== 0) {
  throw new Error(`ffmpeg exited with code ${result.status}`);
}

const files = readdirSync(outDir).filter((f) => f.endsWith(".png"));
const bytes = files.reduce((sum, f) => sum + statSync(join(outDir, f)).size, 0);

console.log(
  `  ${files.length} frames  ${(bytes / 1073741824).toFixed(2)} GB\n\nNow run: npm run frames\n`
);
