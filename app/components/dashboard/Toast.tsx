"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Toast = { id: number; text: string; tone: "ok" | "err" };

const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function readFlash() {
  const row = document.cookie.split("; ").find((item) => item.startsWith("dash-flash="));
  if (!row) return null;
  document.cookie = "dash-flash=; path=/; max-age=0";
  const raw = row.slice("dash-flash=".length);
  const sep = raw.indexOf(":");
  if (sep === -1) return null;
  try {
    return {
      ok: raw.slice(0, sep) === "1",
      message: decodeURIComponent(raw.slice(sep + 1)),
    };
  } catch {
    return null;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-4), { id, text, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);
  const value = useMemo(() => push, [push]);

  useEffect(() => {
    const next = readFlash();
    if (next?.message) push(next.message, next.ok ? "ok" : "err");
  }, [pathname, push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {items.map((item) => (
          <p
            key={item.id}
            className={`pointer-events-auto max-w-sm rounded-full px-4 py-2 font-body text-sm shadow-lg ${
              item.tone === "err" ? "bg-red-600 text-white" : "bg-gold text-ink"
            }`}
          >
            {item.text}
          </p>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
