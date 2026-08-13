import Link from "next/link";

import { courseUi } from "@/content/content";
import { t as translate, type Locale } from "@/lib/i18n";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The chevron is a plain `/` rather than an arrow icon so it needs no mirroring
 * in RTL — the flex row already reverses, which puts the trail in reading order
 * in both directions.
 */
export function Breadcrumb({ items, locale }: { items: Crumb[]; locale: Locale }) {
  return (
    <nav aria-label={translate(courseUi.breadcrumbLabel, locale)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs text-cream-faint">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-ink-line">
                /
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors duration-300 ease-cinema hover:text-cream"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-cream-dim">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
