import type { Config } from "tailwindcss";

/**
 * All colours are declared as CSS variables in app/globals.css.
 * Change the palette there once and it propagates everywhere.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          card: "rgb(var(--ink-card) / <alpha-value>)",
          line: "rgb(var(--ink-line) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)",
          muted: "rgb(var(--gold-muted) / <alpha-value>)",
          deep: "rgb(var(--gold-deep) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "rgb(var(--cream) / <alpha-value>)",
          dim: "rgb(var(--cream-dim) / <alpha-value>)",
          faint: "rgb(var(--cream-faint) / <alpha-value>)",
        },
      },
      fontFamily: {
        // --font-display / --font-body are remapped per `lang` in globals.css,
        // so these two utilities resolve to the right script automatically.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Escape hatches for content that must stay Latin inside Arabic pages
        // (the wordmark, email, phone).
        "latin-display": ["var(--font-latin-display)", "system-ui", "sans-serif"],
        latin: ["var(--font-latin-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        ultrawide: "0.28em",
      },
      maxWidth: {
        shell: "88rem",
      },
      transitionTimingFunction: {
        // Slow, expensive-feeling easing. Never bouncy.
        cinema: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
