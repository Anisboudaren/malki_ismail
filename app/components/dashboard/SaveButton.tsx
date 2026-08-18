"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { BusyLabel } from "@/app/components/ui/BusyLabel";
import { btnClass } from "./ui";
import { readFlash, useToast } from "./Toast";

export function SaveButton({
  label = "Enregistrer",
  pendingLabel = "Enregistrement…",
  className = btnClass,
  formAction,
}: {
  label?: string;
  pendingLabel?: string;
  className?: string;
  formAction?: ComponentProps<"button">["formAction"];
}) {
  const { pending } = useFormStatus();
  const toast = useToast();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      const next = readFlash();
      if (next?.message) toast(next.message, next.ok ? "ok" : "err");
    }
    wasPending.current = pending;
  }, [pending, toast]);

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-busy={pending}
      formAction={formAction}
    >
      {pending ? <BusyLabel>{pendingLabel}</BusyLabel> : label}
    </button>
  );
}
