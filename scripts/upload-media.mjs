/**
 * Pushes generated hero media to the linked Vercel Blob store.
 *
 *   npm run frames:upload
 *
 * Reads WebP frames/stills from /public and the source mp4 from the repo root,
 * then overwrites the same pathnames on Blob so URLs stay stable.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const CONCURRENCY = 8;
const CACHE_YEAR = 60 * 60 * 24 * 365;

function loadLocalEnv() {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!raw || raw.startsWith("#")) continue;
    const eq = raw.indexOf("=");
    if (eq === -1) continue;
    const key = raw.slice(0, eq).trim();
    let value = raw.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function listWebp(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => extname(name).toLowerCase() === ".webp")
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => join(dir, name));
}

loadLocalEnv();

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error(
    "BLOB_READ_WRITE_TOKEN is missing. Run `vercel env pull .env.local --yes` from the linked project, then retry."
  );
}

const jobs = [];

for (const variant of ["desktop", "mobile"]) {
  const dir = join(root, "public", "sequence", variant);
  for (const file of listWebp(dir)) {
    jobs.push({
      file,
      pathname: `sequence/${variant}/${basename(file)}`,
      contentType: "image/webp",
    });
  }
}

for (const name of ["hero-fallback.webp", "still-course.webp", "still-academy.webp"]) {
  const file = join(root, "public", name);
  if (existsSync(file)) {
    jobs.push({ file, pathname: name, contentType: "image/webp" });
  }
}

const video = join(root, "hero section phototgrapher vedio.mp4");
if (existsSync(video)) {
  jobs.push({
    file: video,
    pathname: "video/hero.mp4",
    contentType: "video/mp4",
  });
}

if (jobs.length === 0) {
  throw new Error("Nothing to upload. Run `npm run frames` first.");
}

console.log(`\nUploading ${jobs.length} files to Vercel Blob…\n`);

let cursor = 0;
let failed = 0;

async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    const label = `${String(cursor).padStart(3)}/${jobs.length}  ${job.pathname}`;
    try {
      await put(job.pathname, readFileSync(job.file), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: CACHE_YEAR,
        contentType: job.contentType,
      });
      console.log(`  ok   ${label}`);
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  fail ${label}  ${message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

if (failed) {
  throw new Error(`${failed} upload(s) failed.`);
}

const base = "https://6peenlbssgljumwa.public.blob.vercel-storage.com";
console.log(`\nDone. ${jobs.length} files on Blob.`);
console.log(`Base URL: ${base}\n`);
