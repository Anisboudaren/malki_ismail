"use client";

import { useState, type ReactNode } from "react";
import { btnGhost } from "./ui";
import { SaveButton } from "./SaveButton";

export function ConfirmSubmit({
  action,
  message,
  label,
  className,
  extra,
}: {
  action: (formData: FormData) => unknown;
  message: string;
  label: ReactNode;
  className?: string;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className={className ?? btnGhost} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-ink-line bg-ink-card p-5 shadow-xl">
        <p className="font-body text-sm leading-relaxed text-cream">{message}</p>
        <form
          action={async (formData) => {
            await action(formData);
          }}
          className="mt-4 space-y-3"
        >
          {extra}
          <div className="flex flex-wrap gap-2">
            <SaveButton label="Confirmer" pendingLabel="Confirmation…" />
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
