"use client";

import { useEffect, useState } from "react";
import type { SequenceMode } from "./sequence";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * Decides how heavy the hero is allowed to be.
 *
 *   desktop → 120 frames @ 1280px
 *   mobile  →  48 frames @  720px
 *   static  → poster image only, no pinning
 *
 * Returns null until the check has run on the client, so the server render and
 * the first client render agree (both show the poster).
 */
export function useSequenceMode(): SequenceMode | null {
  const [mode, setMode] = useState<SequenceMode | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);

    const resolve = () => {
      if (reduced.matches) return setMode("static");

      const connection = (
        navigator as Navigator & { connection?: NetworkInformation }
      ).connection;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

      const constrained =
        connection?.saveData === true ||
        (connection?.effectiveType != null &&
          ["slow-2g", "2g", "3g"].includes(connection.effectiveType)) ||
        (memory != null && memory <= 2);

      if (constrained) return setMode("static");
      setMode(mobile.matches ? "mobile" : "desktop");
    };

    resolve();
    mobile.addEventListener("change", resolve);
    reduced.addEventListener("change", resolve);
    return () => {
      mobile.removeEventListener("change", resolve);
      reduced.removeEventListener("change", resolve);
    };
  }, []);

  return mode;
}
