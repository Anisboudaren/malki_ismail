"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { useToast } from "./Toast";
import { inputClass } from "./ui";
import {
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  VIDEO_MAX_BYTES,
  VIDEO_TYPES,
} from "@/lib/upload-limits";

export function BlobUploader({
  kind,
  label,
  currentUrl,
  onUploaded,
}: {
  kind: "image" | "video";
  label: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => Promise<void> | void;
}) {
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const max = kind === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
  const types = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";
  const limitLabel = kind === "image" ? "JPEG/PNG/WebP, 5 Mo max" : "MP4/WebM/MOV, 100 Mo max";

  return (
    <div className="space-y-2">
      <p className="font-body text-xs text-cream-faint">{label} · {limitLabel}</p>
      {currentUrl ? (
        kind === "image" ? (
          <img src={currentUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <p className="truncate font-body text-xs text-cream-dim" dir="ltr">
            {currentUrl}
          </p>
        )
      ) : null}
      <input
        type="file"
        accept={accept}
        disabled={progress !== null}
        className={`${inputClass} file:me-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-ink`}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setError(null);
          if (!types.includes(file.type)) {
            setError("Format non accepté.");
            toast("Format non accepté.", "err");
            return;
          }
          if (file.size > max) {
            setError(`Fichier trop lourd (${limitLabel}).`);
            toast("Fichier trop lourd.", "err");
            return;
          }
          setProgress(0);
          try {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/upload",
              multipart: kind === "video",
              onUploadProgress: ({ percentage }) => {
                setProgress(Math.round(percentage));
              },
            });
            await onUploaded(blob.url);
            toast("Fichier envoyé.");
          } catch (err) {
            const message = err instanceof Error ? err.message : "Échec du téléversement.";
            setError(message);
            toast(message, "err");
          } finally {
            setProgress(null);
          }
        }}
      />
      {progress !== null ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
          <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      {error ? <p className="font-body text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
