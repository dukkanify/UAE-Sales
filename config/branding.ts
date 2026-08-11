/**
 * Centralized branding — AviatorPass Option A (Horizon Blue & Sun Gold).
 * Official: Aero Blue #2E7DAA · Altitude Orange #DD9B30 · Academic Grey #7C7B80
 * Option A marketing names: Horizon Blue · Sun Gold (same hex values).
 * Typography: Stimulatio Flat (display, Space Grotesk web substitute) + IBM Plex Sans
 */

import { siteStatic } from "@/config/site-static";
import { theme } from "@/config/theme";

export const brandingConfig = {
  platformName: siteStatic.name,
  companyName: siteStatic.legalName,
  tagline: "YOUR AVIATION JOURNEY STARTS HERE",
  secondaryTagline: "UNLOCK YOUR PILOT LICENSE",
  paletteName: "Option A — Horizon Blue & Sun Gold",
  language: siteStatic.language,
  englishOnly: siteStatic.englishOnly,
  contactEmail: siteStatic.contactEmail,
  supportEmail: siteStatic.supportEmail,
  locations: [...siteStatic.locations],
  socialHandle: siteStatic.socialHandle,
  social: { ...siteStatic.social },
  assets: {
    logo: siteStatic.brand.logo,
    logoDark: siteStatic.brand.logoDark,
    logoStacked: siteStatic.brand.logoStacked,
    icon: siteStatic.brand.icon,
    favicon: siteStatic.brand.favicon,
    openGraph: siteStatic.brand.openGraph,
    sourceDir: "/brand/source",
    guidelinesPdf: "/brand/source/AVIATORPASS_Brand_Guidelines.pdf",
    optionAReference: "/brand/source/option-a-horizon-sun-gold.png",
  },
  colors: {
    /** Horizon Blue / Aero Blue — primary */
    primary: theme.colors.primary.DEFAULT,
    horizonBlue: theme.aliases.horizonBlue,
    aeroBlue: theme.aliases.aeroBlue,
    /** Sun Gold / Altitude Orange — accent */
    accent: theme.colors.accent.DEFAULT,
    sunGold: theme.aliases.sunGold,
    altitudeOrange: theme.aliases.altitudeOrange,
    /** Academic Grey — secondary / muted */
    academic: theme.colors.academic.DEFAULT,
    ink: "#0B1A24",
    ...theme.colors.support,
  },
  typography: {
    /** Official: Stimulatio Flat — Space Grotesk until licensed files land in public/fonts/ */
    display: "Space Grotesk",
    displayOfficial: "Stimulatio Flat",
    /** Official secondary */
    body: "IBM Plex Sans",
  },
  pending: {
    brandGuidelines: false,
    officialColorPalette: false,
    /** Stimulatio Flat not on Google Fonts — Space Grotesk substituted */
    officialTypography: true,
    brandStyleGuide: false,
  },
  metaDescription: siteStatic.description,
} as const;

export type BrandingConfig = typeof brandingConfig;
