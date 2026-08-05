/**
 * Application-wide site configuration — ATPL PASS defaults.
 * Runtime overrides live in platform settings (Super Admin).
 */

import { publicEnv } from "@/config/env";

export const siteConfig = {
  name: "ATPL PASS",
  shortName: "ATPL",
  legalName: "ATPL PASS",
  description:
    "The 2030 aviation course platform for ATPL theory, live Zoom coaching, and exam mastery.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "en",
  direction: "ltr" as const,
  contactEmail: "ME@ABDULAZIZALSHOAIL.COM",
  supportEmail: "ME@ABDULAZIZALSHOAIL.COM",
  locations: ["Kuwait", "Dubai"] as const,
  socialHandle: "@ABDULAZIZ_ALSHOAIL",
  social: {
    instagram: "https://instagram.com/ABDULAZIZ_ALSHOAIL",
    twitter: "https://x.com/ABDULAZIZ_ALSHOAIL",
    linkedin: "",
    youtube: "",
  },
  brand: {
    logo: "/brand/logo.svg",
    logoDark: "/brand/logo-dark.svg",
    icon: "/brand/icon.svg",
    favicon: "/brand/favicon.svg",
    openGraph: "/brand/og.svg",
  },
  language: "en" as const,
  englishOnly: true,
} as const;

export type SiteConfig = typeof siteConfig;
