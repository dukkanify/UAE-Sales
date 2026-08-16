/**
 * Zod-free site constants safe for Client Components.
 * Never import `@/config/env` here — that pulls Zod into the browser bundle and
 * breaks marketing layouts when webpack vendor chunks go stale under HMR.
 */

export const siteStatic = {
  name: "AviatorPass",
  shortName: "AviatorPass",
  legalName: "AviatorPass",
  description:
    "AviatorPass — your aviation journey starts here. ATPL theory, live Zoom instructor coaching, quizzes, and exam mastery.",
  tagline: "YOUR AVIATION JOURNEY STARTS HERE",
  secondaryTagline: "UNLOCK YOUR PILOT LICENSE",
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
    /** Official lockups — cache-busted after brand guide apply */
    logo: "/brand/logo.png?v=brand-guide-3",
    logoDark: "/brand/logo-dark.png?v=brand-guide-3",
    logoStacked: "/brand/logo-stacked.png?v=brand-guide-3",
    icon: "/brand/icon.png?v=brand-guide-3",
    /** Light mark for dark chrome (sidebar / collapsed nav) */
    iconLight: "/brand/icon-light.png?v=brand-guide-3",
    favicon: "/brand/favicon.svg?v=brand-guide-3",
    openGraph: "/brand/og.png?v=brand-guide-3",
    appleTouchIcon: "/brand/apple-touch-icon.png?v=brand-guide-3",
    /** Vector masters kept for edit / favicon / print */
    logoSvg: "/brand/logo.svg",
    logoDarkSvg: "/brand/logo-dark.svg",
    logoStackedSvg: "/brand/logo-stacked.svg",
    iconSvg: "/brand/icon.svg",
  },
  language: "en" as const,
  englishOnly: true,
} as const;

export type SiteStatic = typeof siteStatic;
