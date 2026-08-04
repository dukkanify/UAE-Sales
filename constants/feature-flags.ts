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
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];
