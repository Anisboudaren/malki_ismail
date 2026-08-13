import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Reveal } from "./Reveal";

/* -------------------------------------------------------------------------- */
/* Section shell                                                               */
/* -------------------------------------------------------------------------- */

export function Section({
  id,
  children,
  className = "",
  tone = "base",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "base" | "soft";
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 py-24 md:py-32 lg:py-40 ${
        tone === "soft" ? "bg-ink-soft" : "bg-ink"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/** Eyebrow + heading + optional body, used at the top of most sections. */
export function SectionHeader({
  eyebrow,
  title,
  body,
  align = "start",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: "start" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <p className="eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="heading-lg text-balance">{title}</h2>
      </Reveal>
      {body && (
        <Reveal delay={0.12}>
          <p className={`body-lg mt-6 text-pretty ${centered ? "mx-auto" : ""}`}>{body}</p>
        </Reveal>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "gold" | "outline" | "ghost";
  size?: "md" | "lg";
};

const VARIANTS = {
  gold: "bg-gold text-ink hover:bg-cream",
  outline: "border border-cream/25 text-cream hover:border-gold hover:text-gold",
  ghost: "text-cream-dim hover:text-cream",
} as const;

const SIZES = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[0.9375rem]",
} as const;

export function ButtonLink({
  children,
  variant = "gold",
  size = "md",
  className = "",
  href,
  ...rest
}: ButtonProps) {
  // Enrolment lives on the WordPress platform, so those links leave the site.
  const external = href?.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors duration-300 ease-cinema focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Misc                                                                        */
/* -------------------------------------------------------------------------- */

/** Thin gold-to-transparent rule used between sections. */
export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-px w-full bg-gradient-to-r from-gold-muted/50 via-ink-line to-transparent ${className}`}
    />
  );
}
