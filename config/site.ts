/**
 * Application-wide site configuration.
 */

import { publicEnv } from "@/config/env";

export const siteConfig = {
  name: "Eager Pilots",
  shortName: "AEP",
  legalName: "Eager Pilots for Aviation Consultation and Training",
  description:
    "Professional aviation education, consultation, and pilot training platform.",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  locale: "en",
  direction: "ltr" as const,
  contactEmail: "info@eagerpilots.com",
  social: {
    twitter: "",
    linkedin: "",
    youtube: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
