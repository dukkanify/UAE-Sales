/**
 * Feature flag keys — values live in platform settings.
 */

export const FEATURE_FLAG_KEYS = [
  "blog",
  "communities",
  "certificates",
  "payments",
  "zoom",
  "advertisements",
  "wallet",
  "courses",
  "calendar",
  "ai",
  "mockExams",
  "cgi",
  "schedule",
  "installments",
  "emailAutomation",
  "messaging",
  "reports",
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];
