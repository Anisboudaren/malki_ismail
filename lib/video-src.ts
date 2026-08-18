const PLAYER_HOST = "https://malki.publit.io";

function fileCodeFromUrl(src: string) {
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith("publit.io")) return null;
    const fileMatch = url.pathname.match(
      /\/file\/(?:[^/]+\/)*([^/]+?)(?:\.(html|m3u8|mp4|webm|mov|jpg|jpeg|png|webp))?$/i,
    );
    const downloadMatch = url.pathname.match(
      /\/download\/([^/]+?)(?:\.(mp4|webm|mov))?$/i,
    );
    const code = fileMatch?.[1] || downloadMatch?.[1] || null;
    return code ? code.replace(/_\d+$/, "") : null;
  } catch {
    return null;
  }
}

function looksLikePublitioCode(value: string) {
  return /^[A-Za-z0-9]{6,14}$/.test(value.trim());
}

/** Publitio player id from a stored URL, or the asset’s Publitio id. */
export function publitioFileCode(src: string, publitioId?: string | null) {
  const trimmed = src.trim();
  if (looksLikePublitioCode(trimmed)) return trimmed;
  return fileCodeFromUrl(src) || publitioId?.trim().replace(/_\d+$/, "") || null;
}

export function publitioEmbedUrl(code: string) {
  return `${PLAYER_HOST}/file/${code}.html`;
}

/** Official Publitio HTML player. Required when HLS protection is on. */
export function publitioPlayerSrc(src: string, publitioId?: string | null) {
  try {
    const url = new URL(src);
    if (
      url.hostname.endsWith("publit.io") &&
      /\/file\/[^/]+\.html$/i.test(url.pathname)
    ) {
      return src;
    }
  } catch {
    /* ignore */
  }
  const code = publitioFileCode(src, publitioId);
  return code ? publitioEmbedUrl(code) : null;
}

export function isHlsSrc(src: string) {
  return /\.m3u8(\?|$)/i.test(src);
}

/** Persist / play this URL: Publitio share player, otherwise the original file. */
export function storedVideoUrl(src: string, publitioId?: string | null) {
  return publitioPlayerSrc(src, publitioId) ?? src.trim();
}
