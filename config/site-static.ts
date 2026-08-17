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
    /** Official lockups from AVIATOR PASS brand guidelines PDF */
    logo: "/brand/logo.png?v=brand-guide-4",
    logoDark: "/brand/logo-dark.png?v=brand-guide-4",
    logoStacked: "/brand/logo-stacked.png?v=brand-guide-4",
    icon: "/brand/icon.png?v=brand-guide-4",
    /** Light mark for dark chrome (sidebar / collapsed nav) */
    iconLight: "/brand/icon-light.png?v=brand-guide-4",
    favicon: "/brand/favicon.svg?v=brand-guide-4",
    openGraph: "/brand/og.png?v=brand-guide-4",
    appleTouchIcon: "/brand/apple-touch-icon.png?v=brand-guide-4",
    /** Approximate SVG masters — edit/favicon only; UI uses PNGs above */
    logoSvg: "/brand/logo.svg",
    logoDarkSvg: "/brand/logo-dark.svg",
    logoStackedSvg: "/brand/logo-stacked.svg",
    iconSvg: "/brand/icon.svg",
  },
  language: "en" as const,
  englishOnly: true,
} as const;

export type SiteStatic = typeof siteStatic;
