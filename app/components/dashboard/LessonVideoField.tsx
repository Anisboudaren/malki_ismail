"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LessonPlayer } from "./LessonPlayer";
import { attachMediaToLesson } from "@/app/actions/library";
import { setLessonThumbUrl, setLessonVideoUrl } from "@/app/actions/media";
import { BlobUploader } from "@/app/components/dashboard/BlobUploader";
import { inputClass } from "@/app/components/dashboard/ui";
import { useToast } from "@/app/components/dashboard/Toast";
import type { LibraryAsset } from "@/app/components/dashboard/LessonMediaPicker";
import { storedVideoUrl } from "@/lib/video-src";

function assetForUrl(assets: LibraryAsset[], url?: string | null) {
  if (!url) return null;
  return (
    assets.find((asset) => {
      if (asset.url === url) return true;
      if (storedVideoUrl(asset.url, asset.publitioId) === url) return true;
      return Boolean(asset.publitioId && url.includes(asset.publitioId));
    }) ?? null
  );
}

export function LessonVideoField({
  lessonId,
  assets,
  currentUrl,
  currentThumb,
  pickLabel,
  uploadLabel,
  attachedLabel,
  emptyLabel,
  formId,
}: {
  lessonId: string;
  assets: LibraryAsset[];
  currentUrl?: string | null;
  currentThumb?: string | null;
  pickLabel: string;
  uploadLabel: string;
  attachedLabel: string;
  emptyLabel: string;
  formId?: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const initial = useMemo(() => assetForUrl(assets, currentUrl), [assets, currentUrl]);
  const [mediaId, setMediaId] = useState(initial?.id ?? "");
  const [url, setUrl] = useState(currentUrl ?? "");
  const [thumb, setThumb] = useState(currentThumb ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setUrl(currentUrl ?? "");
    setThumb(currentThumb ?? "");
    setMediaId(assetForUrl(assets, currentUrl)?.id ?? "");
  }, [assets, currentUrl, currentThumb]);

  async function pickAsset(id: string) {
    setMediaId(id);
    if (!id) return;
    const asset = assets.find((item) => item.id === id);
    if (!asset) return;
    setUrl(storedVideoUrl(asset.url, asset.publitioId));
    if (asset.thumbnailUrl) setThumb(asset.thumbnailUrl);
    setPending(true);
    const data = new FormData();
    data.set("mediaId", id);
    data.set("lessonId", lessonId);
    const result = await attachMediaToLesson(data);
    setPending(false);
    toast(result.ok ? "Vidéo liée." : "Impossible de lier la vidéo.", result.ok ? "ok" : "err");
    if (result.ok) router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-ink-line bg-ink p-3">
      <p className="font-body text-xs text-cream-faint">{url ? attachedLabel : emptyLabel}</p>
      {url ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink-line bg-black" dir="ltr">
          <LessonPlayer src={url} title="Aperçu" fill />
        </div>
      ) : null}
      {assets.length > 0 ? (
        <select
          className={inputClass}
          name="mediaId"
          form={formId}
          value={mediaId}
          disabled={pending}
          onChange={(event) => void pickAsset(event.target.value)}
        >
          <option value="">{pending ? "Enregistrement…" : pickLabel}</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.title || asset.filename}
            </option>
          ))}
        </select>
      ) : null}
      <BlobUploader
        kind="video"
        label={uploadLabel}
        currentUrl={url || null}
        onUploaded={async (next) => {
          setUrl(next);
          await setLessonVideoUrl(lessonId, next);
          toast("Vidéo liée.");
          router.refresh();
        }}
      />
      <BlobUploader
        kind="image"
        label="Miniature de la leçon"
        currentUrl={thumb || null}
        onUploaded={async (next) => {
          setThumb(next);
          await setLessonThumbUrl(lessonId, next);
          toast("Miniature liée.");
          router.refresh();
        }}
      />
    </div>
  );
}
