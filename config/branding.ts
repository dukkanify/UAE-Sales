/**
 * Centralized branding configuration — official AviatorPass guidelines.
 * Uses site-static (no Zod) so client layouts stay resilient under HMR.
 */

import { siteStatic } from "@/config/site-static";
import { theme } from "@/config/theme";

export const brandingConfig = {
  platformName: siteStatic.name,
  companyName: siteStatic.legalName,
  tagline: "Aviation course platform · 2030",
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
    icon: siteStatic.brand.icon,
    favicon: siteStatic.brand.favicon,
    openGraph: siteStatic.brand.openGraph,
    sourceDir: "/brand/source",
    guidelinesPdf: "/brand/source/AVIATORPASS_Brand_Guidelines.pdf",
  },
  colors: {
    primary: theme.colors.primary.DEFAULT,
    accent: theme.colors.accent.DEFAULT,
    academic: theme.colors.academic.DEFAULT,
    ink: "#0B1A24",
  },
  typography: {
    /** Official: Stimulatio Flat — web substitute Space Grotesk */
    display: "Space Grotesk",
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
