import { loadEnvConfig } from "@next/env";

const BASE = "https://api.publit.io/v1";
const TOKEN_KEY = "PUBLITIO_API_TOKEN";
const PLAYER_HOST = "https://malki.publit.io";

export type PublitioFile = {
  id: string;
  public_id?: string | null;
  title?: string;
  type?: string;
  extension?: string;
  size?: number;
  url_preview?: string;
  url_thumbnail?: string;
  created_at?: string;
};

let envReady = false;

function publitioToken() {
  if (!envReady) {
    loadEnvConfig(process.cwd());
    envReady = true;
  }
  return (process.env[TOKEN_KEY] ?? "").trim();
}

export function hasPublitioConfig() {
  return Boolean(publitioToken());
}

async function publitioRequest(path: string, init?: RequestInit) {
  const token = publitioToken();
  if (!token) {
    throw new Error("PUBLITIO_API_TOKEN is not set");
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as
    | { success?: boolean; message?: string; files?: PublitioFile[] }
    | PublitioFile
    | null;

  if (!res.ok) {
    const message =
      body && "message" in body && body.message
        ? body.message
        : `Publitio ${res.status}`;
    throw new Error(message);
  }

  return body;
}

function fileCode(file: PublitioFile) {
  return (file.public_id || file.id || "").trim();
}

/** HLS preview: https://malki.publit.io/file/{id}.m3u8 */
export function filePlaybackUrl(file: PublitioFile) {
  const code = fileCode(file);
  if (code) return `${PLAYER_HOST}/file/${code}.m3u8`;
  const preview = file.url_preview || "";
  if (preview.endsWith(".html")) return preview.replace(/\.html$/i, ".m3u8");
  return preview;
}

/** Share / embed player: https://malki.publit.io/file/{id}.html */
export function fileEmbedUrl(file: PublitioFile) {
  const code = fileCode(file);
  if (code) return `${PLAYER_HOST}/file/${code}.html`;
  return filePlaybackUrl(file).replace(/\.m3u8$/i, ".html");
}

export function fileFilename(file: PublitioFile) {
  const title = (file.title || "").trim();
  if (title) return title;
  return file.extension ? `${file.id}.${file.extension}` : file.id;
}

export async function listPublitioVideos(search?: string) {
  const params = new URLSearchParams({
    filter_type: "video",
    limit: "1000",
    offset: "0",
  });
  if (search?.trim()) params.set("search", search.trim());
  const data = await publitioRequest(`/files/list?${params.toString()}`);
  const files = data && "files" in data ? data.files ?? [] : [];
  return files.filter((file) => file.type === "video" || !file.type);
}

export async function uploadPublitioFile(file: File, title?: string) {
  const form = new FormData();
  form.set("file", file);
  form.set("title", title || file.name);

  const data = (await publitioRequest("/files/create", {
    method: "POST",
    body: form,
  })) as PublitioFile;

  if (!data?.id) {
    throw new Error("Publitio upload did not return a file id");
  }
  return data;
}

export function sameFilename(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
