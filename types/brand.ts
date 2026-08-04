/**
 * Public branding payload for chrome, SEO consumers, and client components.
 */

export type PublicBrandPayload = {
  platformName: string;
  companyName: string;
  contactEmail: string;
  supportEmail: string;
  websiteUrl: string;
  locations: string[];
  socialHandle: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  footerText: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  openGraphImageUrl: string;
  primaryColor: string;
  accentColor: string;
  language: string;
  englishOnly: boolean;
  metaDescription: string;
};
