"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DELAY_MS = 1000;

function isInternalNav(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return false;
  }
  return true;
}

export function NavigationLoader() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [visible, setVisible] = useState(false);
  const pending = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || !isInternalNav(anchor)) return;
      pending.current = true;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (pending.current) setVisible(true);
      }, DELAY_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    pending.current = false;
    if (timer.current) window.clearTimeout(timer.current);
    setVisible(false);
  }, [pathname, search]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 backdrop-blur-[2px]">
      <div
        className="h-11 w-11 animate-spin rounded-full border-2 border-gold/30 border-t-gold"
        aria-label="Chargement"
      />
    </div>
  );
}
