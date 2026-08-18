import type { ReactNode } from "react";

/** Spinner + label used on submit buttons so the user can see work in progress. */
export function BusyLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span
        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden
      />
      {children}
    </span>
  );
}
