import type { Metadata, Viewport } from "next";

import { FONT_VARS } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malki Academy",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={FONT_VARS} suppressHydrationWarning>
      <body className="bg-ink font-body text-cream antialiased">{children}</body>
    </html>
  );
}
