import { Archivo, IBM_Plex_Sans_Arabic, Inter, Noto_Kufi_Arabic } from "next/font/google";

const latinDisplay = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-latin-display",
  display: "swap",
});

const latinBody = Inter({
  subsets: ["latin"],
  variable: "--font-latin-body",
  display: "swap",
});

const arabicDisplay = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ar-display",
  display: "swap",
});

const arabicBody = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ar-body",
  display: "swap",
});

export const FONT_VARS = [
  latinDisplay.variable,
  latinBody.variable,
  arabicDisplay.variable,
  arabicBody.variable,
].join(" ");
