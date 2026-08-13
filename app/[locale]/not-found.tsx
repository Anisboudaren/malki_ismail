import Link from "next/link";

import { brand } from "@/content/content";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-8 bg-ink px-6 text-center">
      <p className="font-latin-display text-lg font-semibold tracking-tightest text-cream">
        {brand.name}
        <span className="text-gold">.</span>
      </p>
      <p className="font-display text-[clamp(4rem,14vw,9rem)] font-semibold leading-none tracking-tightest text-cream">
        404
      </p>
      <p className="max-w-md font-body text-base text-cream-dim">
        Page introuvable.
        <br />
        <span lang="ar">الصفحة غير موجودة.</span>
      </p>
      <div className="flex gap-3">
        <Link
          href="/fr"
          className="inline-flex items-center rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-ink transition-colors duration-300 hover:bg-cream"
        >
          Français
        </Link>
        <Link
          href="/ar"
          lang="ar"
          className="inline-flex items-center rounded-full border border-cream/25 px-6 py-3 font-body text-sm font-medium text-cream transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          العربية
        </Link>
      </div>
    </main>
  );
}
