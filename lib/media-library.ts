import { prisma } from "@/lib/prisma";
import {
  fileEmbedUrl,
  fileFilename,
  filePlaybackUrl,
  listPublitioVideos,
  type PublitioFile,
} from "@/lib/publitio";

export function mediaFromPublitio(file: PublitioFile, filename?: string) {
  return {
    publitioId: file.id,
    title: (file.title || file.id).trim(),
    filename: filename || fileFilename(file),
    url: fileEmbedUrl(file),
    thumbnailUrl: file.url_thumbnail || null,
    bytes: typeof file.size === "number" ? file.size : null,
  };
}

export async function upsertPublitioVideos() {
  const files = await listPublitioVideos();
  let count = 0;
  for (const file of files) {
    if (!file.id || !filePlaybackUrl(file)) continue;
    const data = mediaFromPublitio(file);
    await prisma.mediaAsset.upsert({
      where: { publitioId: file.id },
      create: data,
      update: data,
    });
    count += 1;
  }
  return count;
}
