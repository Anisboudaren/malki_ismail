"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { setCoursePreviewUrl, setCourseThumbUrl } from "@/app/actions/media";
import { BlobUploader } from "@/app/components/dashboard/BlobUploader";
import { LessonPlayer } from "@/app/components/dashboard/LessonPlayer";
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

function assetForThumb(assets: LibraryAsset[], url?: string | null) {
  if (!url) return null;
  return assets.find((asset) => asset.thumbnailUrl === url) ?? null;
}

export function CourseMediaFields({
  courseId,
  thumbnailUrl,
  previewVideoUrl,
  assets = [],
}: {
  courseId: string;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  assets?: LibraryAsset[];
}) {
  const toast = useToast();
  const router = useRouter();
  const withThumbs = assets.filter((asset) => asset.thumbnailUrl);
  const [thumb, setThumb] = useState(thumbnailUrl ?? "");
  const [preview, setPreview] = useState(previewVideoUrl ?? "");
  const [thumbId, setThumbId] = useState(assetForThumb(withThumbs, thumbnailUrl)?.id ?? "");
  const [previewId, setPreviewId] = useState(assetForUrl(assets, previewVideoUrl)?.id ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setThumb(thumbnailUrl ?? "");
    setPreview(previewVideoUrl ?? "");
    setThumbId(assetForThumb(assets, thumbnailUrl)?.id ?? "");
    setPreviewId(assetForUrl(assets, previewVideoUrl)?.id ?? "");
  }, [assets, previewVideoUrl, thumbnailUrl]);

  const previewAsset = useMemo(() => assetForUrl(assets, preview), [assets, preview]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-display text-base font-semibold">Miniature</h3>
        <p className="font-body text-xs text-cream-faint">Bibliothèque (vignette) ou nouvel envoi.</p>
        {thumb ? (
          <img src={thumb} alt="" className="h-28 w-full rounded-xl object-cover" />
        ) : null}
        {withThumbs.length > 0 ? (
          <select
            className={inputClass}
            value={thumbId}
            disabled={pending}
            onChange={async (event) => {
              const id = event.target.value;
              setThumbId(id);
              const asset = withThumbs.find((item) => item.id === id);
              if (!asset?.thumbnailUrl) return;
              setThumb(asset.thumbnailUrl);
              setPending(true);
              const ok = await setCourseThumbUrl(courseId, asset.thumbnailUrl);
              setPending(false);
              toast(ok ? "Miniature liée." : "Impossible de lier la miniature.", ok ? "ok" : "err");
              if (ok) router.refresh();
            }}
          >
            <option value="">Choisir dans la bibliothèque</option>
            {withThumbs.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title || asset.filename}
              </option>
            ))}
          </select>
        ) : null}
        <BlobUploader
          kind="image"
          label="Téléverser une image"
          currentUrl={thumb || null}
          onUploaded={async (url) => {
            setThumb(url);
            const ok = await setCourseThumbUrl(courseId, url);
            toast(ok ? "Miniature liée." : "Impossible de lier la miniature.", ok ? "ok" : "err");
            if (ok) router.refresh();
          }}
        />
      </section>

      <section className="space-y-3">
        <h3 className="font-display text-base font-semibold">Vidéo de présentation</h3>
        <p className="font-body text-xs text-cream-faint">
          Choisissez une vidéo : elle est enregistrée tout de suite.
        </p>
        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink-line bg-black" dir="ltr">
            <LessonPlayer
              src={preview}
              publitioId={previewAsset?.publitioId}
              title="Présentation"
              fill
            />
          </div>
        ) : null}
        {assets.length > 0 ? (
          <select
            className={inputClass}
            value={previewId}
            disabled={pending}
            onChange={async (event) => {
              const id = event.target.value;
              setPreviewId(id);
              const asset = assets.find((item) => item.id === id);
              if (!asset) return;
              const next = storedVideoUrl(asset.url, asset.publitioId);
              setPreview(next);
              setPending(true);
              const ok = await setCoursePreviewUrl(courseId, next);
              setPending(false);
              toast(ok ? "Vidéo de présentation liée." : "Impossible de lier la vidéo.", ok ? "ok" : "err");
              if (ok) router.refresh();
            }}
          >
            <option value="">{pending ? "Enregistrement…" : "Choisir dans la bibliothèque"}</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.title || asset.filename}
              </option>
            ))}
          </select>
        ) : null}
        <BlobUploader
          kind="video"
          label="Téléverser une vidéo"
          currentUrl={preview || null}
          onUploaded={async (url) => {
            setPreview(url);
            const ok = await setCoursePreviewUrl(courseId, url);
            toast(ok ? "Vidéo de présentation liée." : "Impossible de lier la vidéo.", ok ? "ok" : "err");
            if (ok) router.refresh();
          }}
        />
      </section>
    </div>
  );
}
