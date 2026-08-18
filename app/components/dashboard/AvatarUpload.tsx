"use client";

import { setAvatarUrl } from "@/app/actions/media";
import { BlobUploader } from "@/app/components/dashboard/BlobUploader";

export function AvatarUpload({ currentUrl }: { currentUrl?: string | null }) {
  return (
    <BlobUploader
      kind="image"
      label="Photo de profil"
      currentUrl={currentUrl}
      onUploaded={(url) => setAvatarUrl(url)}
    />
  );
}
