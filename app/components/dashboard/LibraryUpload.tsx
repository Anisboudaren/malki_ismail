"use client";

import { useState } from "react";

import { uploadLibraryVideo } from "@/app/actions/library";
import { btnClass } from "@/app/components/dashboard/ui";

export function LibraryUpload({
  label,
  reusedLabel,
  uploadedLabel,
}: {
  label: string;
  reusedLabel: string;
  uploadedLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setPending(true);
        setMessage(null);
        try {
          const result = await uploadLibraryVideo(data);
          if (!result.ok) {
            setMessage("Fichier manquant.");
            return;
          }
          setMessage(result.reused ? reusedLabel : uploadedLabel);
          form.reset();
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Échec du téléversement.");
        } finally {
          setPending(false);
        }
      }}
    >
      <input
        type="file"
        name="file"
        accept="video/*"
        required
        className="block w-full font-body text-sm text-cream-dim file:me-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-body file:text-sm file:text-ink"
      />
      <button type="submit" disabled={pending} className={btnClass}>
        {pending ? "…" : label}
      </button>
      {message ? <p className="font-body text-sm text-cream-dim">{message}</p> : null}
    </form>
  );
}
