import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const ArrowLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const Lock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="10.5" width="16" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 118 0v3.5" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

export const Play = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M8.4 5.3a1 1 0 011.5-.87l8.6 5.2a1.6 1.6 0 010 2.74l-8.6 5.2a1 1 0 01-1.5-.87V5.3z" />
  </svg>
);

export const PlayCircle = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10.4 9.1l4.6 2.9-4.6 2.9V9.1z" />
  </svg>
);

export const Star = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.8l2.85 5.78 6.38.93-4.61 4.5 1.09 6.35L12 17.36l-5.71 3-1.09-6.35-4.61-4.5 6.38-.93L12 2.8z" />
  </svg>
);

export const Globe = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
  </svg>
);

export const User = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0115 0" />
  </svg>
);

export const Users = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0113 0" />
    <path d="M16 5.2a3.5 3.5 0 010 5.6M18 14.4a6.5 6.5 0 013.5 5.6" />
  </svg>
);

export const InfinityIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7.5 8.5a3.5 3.5 0 100 7c2.5 0 3.5-2 4.5-3.5s2-3.5 4.5-3.5a3.5 3.5 0 110 7c-2.5 0-3.5-2-4.5-3.5S10 8.5 7.5 8.5z" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Quote = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M9.4 5.2C6.3 6.7 4.4 9.6 4.4 13v5.8h6.9v-6.9H8.2c0-2.2 1-3.7 2.8-4.6L9.4 5.2zm10 0c-3.1 1.5-5 4.4-5 7.8v5.8h6.9v-6.9h-3.1c0-2.2 1-3.7 2.8-4.6l-1.6-2.1z" />
  </svg>
);

/* -- Social ------------------------------------------------------------- */

export const Instagram = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const Facebook = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.29-.04-1.28-.12-2.43-.12-2.4 0-4.05 1.47-4.05 4.17V9.9H7.5V13h2.72v8h3.28z" />
  </svg>
);

export const TikTok = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M16.3 3h-2.7v12.1a2.4 2.4 0 11-2.4-2.4c.23 0 .45.03.66.1v-2.8a5.2 5.2 0 102.9 4.65V8.9a6 6 0 003.6 1.18V7.3a3.4 3.4 0 01-2.06-.86A3.4 3.4 0 0116.3 3z" />
  </svg>
);

export const YouTube = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M22.2 8.1a2.7 2.7 0 00-1.9-1.9C18.6 5.8 12 5.8 12 5.8s-6.6 0-8.3.45A2.7 2.7 0 001.8 8.1 28 28 0 001.35 12c0 1.32.11 2.63.45 3.9a2.7 2.7 0 001.9 1.9c1.7.45 8.3.45 8.3.45s6.6 0 8.3-.45a2.7 2.7 0 001.9-1.9c.34-1.27.45-2.58.45-3.9s-.11-2.63-.45-3.9zM9.9 15.1V8.9l5.4 3.1-5.4 3.1z" />
  </svg>
);

export const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTok,
  youtube: YouTube,
} as const;

export const valuePropIcons = {
  globe: Globe,
  user: User,
  infinity: InfinityIcon,
  users: Users,
} as const;
