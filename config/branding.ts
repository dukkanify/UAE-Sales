/**
 * Centralized branding configuration — official ATPL PASS guidelines.
 */

import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";

export const brandingConfig = {
  platformName: siteConfig.name,
  companyName: siteConfig.legalName,
  tagline: "Unlock Your Pilot License",
  language: siteConfig.language,
  englishOnly: siteConfig.englishOnly,
  contactEmail: siteConfig.contactEmail,
  supportEmail: siteConfig.supportEmail,
  locations: [...siteConfig.locations],
  socialHandle: siteConfig.socialHandle,
  social: { ...siteConfig.social },
  assets: {
    logo: siteConfig.brand.logo,
    logoDark: siteConfig.brand.logoDark,
    icon: siteConfig.brand.icon,
    favicon: siteConfig.brand.favicon,
    openGraph: siteConfig.brand.openGraph,
    sourceDir: "/brand/source",
    guidelinesPdf: "/brand/source/ATPL_PASS_Brand_Guidelines.pdf",
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
  metaDescription: siteConfig.description,
} as const;

export type BrandingConfig = typeof brandingConfig;
