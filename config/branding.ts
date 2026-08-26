/**
 * Centralized branding — AviatorPass official style guide.
 * Colors: Aviator Blue #143048 · Aviator Gold #CCA04C (#9E712E–#F6C36C) · Academic Grey #7C7B80
 * Typography: Stimulatio Flat (display; Exo 2 web substitute) + IBM Plex Sans
 */

import { siteStatic } from "@/config/site-static";
import { theme } from "@/config/theme";

export const brandingConfig = {
  platformName: siteStatic.name,
  companyName: siteStatic.legalName,
  tagline: "YOUR AVIATION JOURNEY STARTS HERE",
  secondaryTagline: "AIRLINE TRANSPORT PILOT LICENSE",
  paletteName: "Aviator Blue & Aviator Gold",
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
  },
  colors: {
    /** Aviator Blue — primary */
    primary: theme.colors.primary.DEFAULT,
    aviatorBlue: theme.aliases.aviatorBlue,
    /** Aviator Gold — accent */
    accent: theme.colors.accent.DEFAULT,
    aviatorGold: theme.aliases.aviatorGold,
    aviatorGoldDark: theme.aliases.aviatorGoldDark,
    aviatorGoldLight: theme.aliases.aviatorGoldLight,
    /** Academic Grey — secondary / muted */
    academic: theme.colors.academic.DEFAULT,
    ink: "#0B1A24",
    ...theme.colors.support,
  },
  typography: {
    /** Official: Stimulatio Flat — Exo 2 until licensed files land in public/fonts/ */
    display: "Exo 2",
    displayOfficial: "Stimulatio Flat",
    /** Official secondary */
    body: "IBM Plex Sans",
  },
  pending: {
    brandGuidelines: false,
    officialColorPalette: false,
    /** Stimulatio Flat not on Google Fonts — Exo 2 substituted (wide / aerodynamic) */
    officialTypography: true,
    brandStyleGuide: false,
  },
  metaDescription: siteStatic.description,
} as const;

export type BrandingConfig = typeof brandingConfig;
