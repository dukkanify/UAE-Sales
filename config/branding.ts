/**
 * Centralized branding configuration.
 * Update pending fields here (or via Super Admin → Branding) when the client
 * delivers official brand guidelines, palette, typography, and style guide.
 * No architectural redesign required.
 */

import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";

export const brandingConfig = {
  platformName: siteConfig.name,
  companyName: siteConfig.legalName,
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
    /** Drop client AI/PDF/PNG masters into public/brand/source/ without code changes */
    sourceDir: "/brand/source",
  },
  /** Interim tokens — replace when official palette arrives */
  colors: {
    primary: theme.colors.primary.DEFAULT,
    secondary: theme.colors.primary[500],
    accent: theme.colors.accent.DEFAULT,
  },
  typography: {
    display: "Plus Jakarta Sans",
    body: "DM Sans",
  },
  pending: {
    brandGuidelines: true,
    officialColorPalette: true,
    officialTypography: true,
    brandStyleGuide: true,
  },
  metaDescription: siteConfig.description,
} as const;

export type BrandingConfig = typeof brandingConfig;
