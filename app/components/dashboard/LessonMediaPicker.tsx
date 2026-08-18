"use client";

import { useState } from "react";

import { inputClass } from "@/app/components/dashboard/ui";

export type LibraryAsset = {
  id: string;
  title: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  publitioId?: string | null;
};

export function LessonMediaPicker({
  assets,
  defaultMediaId,
  defaultVideoUrl,
  defaultThumbUrl,
  videoPlaceholder,
  thumbPlaceholder,
  pickLabel,
}: {
  assets: LibraryAsset[];
  defaultMediaId?: string | null;
  defaultVideoUrl?: string | null;
  defaultThumbUrl?: string | null;
  videoPlaceholder: string;
  thumbPlaceholder: string;
  pickLabel: string;
}) {
  const [mediaId, setMediaId] = useState(defaultMediaId ?? "");
  const [videoUrl, setVideoUrl] = useState(defaultVideoUrl ?? "");
  const [thumbUrl, setThumbUrl] = useState(defaultThumbUrl ?? "");

  return (
    <div className="space-y-3">
      {assets.length > 0 ? (
        <label className="block">
          <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
            {pickLabel}
          </span>
          <select
            className={`${inputClass} mt-2`}
            value={mediaId}
            onChange={(event) => {
              const next = event.target.value;
              setMediaId(next);
              const asset = assets.find((item) => item.id === next);
              if (asset) {
                setVideoUrl(asset.url);
                setThumbUrl(asset.thumbnailUrl ?? "");
              }
            }}
          >
            <option value="">—</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title || asset.filename}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <input type="hidden" name="mediaId" value={mediaId} />
      <input
        name="videoUrl"
        value={videoUrl}
        onChange={(event) => {
          setVideoUrl(event.target.value);
          setMediaId("");
        }}
        placeholder={videoPlaceholder}
        className={inputClass}
        dir="ltr"
      />
      <input
        name="thumbnailUrl"
        value={thumbUrl}
        onChange={(event) => {
          setThumbUrl(event.target.value);
          setMediaId("");
        }}
        placeholder={thumbPlaceholder}
        className={inputClass}
        dir="ltr"
      />
    </div>
  );
}
