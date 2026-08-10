/**
 * Platform settings service — get/update with audit logging.
 */

import { logAudit, logActivity } from "@/services/auth/activity-log";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { getStoredSettings, patchStoredSettings, readSettingsDb } from "@/services/settings/store";
import { DEFAULT_PLATFORM_SETTINGS } from "@/services/settings/defaults";
import type {
  PlatformSettings,
  SettingsCategory,
  GeneralSettings,
  BrandingSettings,
  EmailSettings,
  NotificationSettings,
  AuthenticationSettings,
  UserManagementSettings,
  SecuritySettings,
  StorageSettings,
  LocalizationSettings,
  FeatureFlags,
  ZoomIntegrationSettings,
  CourseCatalogSettings,
} from "@/types/settings";

export type CategoryPatch = {
  general?: Partial<GeneralSettings>;
  branding?: Partial<BrandingSettings>;
  email?: Partial<EmailSettings>;
  notifications?: Partial<NotificationSettings>;
  authentication?: Partial<AuthenticationSettings>;
  users?: Partial<UserManagementSettings>;
  security?: Partial<SecuritySettings>;
  storage?: Partial<StorageSettings>;
  localization?: Partial<LocalizationSettings>;
  features?: Partial<FeatureFlags>;
  zoom?: Partial<ZoomIntegrationSettings>;
  courses?: Partial<CourseCatalogSettings>;
};

export function getPlatformSettings(): PlatformSettings {
  const settings = getStoredSettings();
  const configured = Boolean(
    process.env.ZOOM_ACCOUNT_ID?.trim() &&
    process.env.ZOOM_CLIENT_ID?.trim() &&
    process.env.ZOOM_CLIENT_SECRET?.trim(),
  );
  return {
    ...settings,
    zoom: {
      ...settings.zoom,
      credentialsConfigured: configured,
    },
  };
}

export function getSettingsCategory<K extends SettingsCategory>(category: K): PlatformSettings[K] {
  return getStoredSettings()[category];
}

export async function updatePlatformSettings(input: {
  patch: CategoryPatch;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<PlatformSettings> {
  const before = getStoredSettings();
  const next = patchStoredSettings(input.patch as Partial<PlatformSettings>, input.actorId);

  await logAudit({
    actorId: input.actorId,
    action: "settings.update",
    resource: "platform_settings",
    beforeState: before as unknown as Record<string, unknown>,
    afterState: next as unknown as Record<string, unknown>,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.SETTINGS_UPDATE,
    entityType: "settings",
    entityId: "platform",
    metadata: { categories: Object.keys(input.patch) },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return next;
}

export function listSettingsHistory(limit = 50) {
  return readSettingsDb().history.slice(0, limit);
}

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const features = getStoredSettings().features;
  if (features[flag] === undefined) {
    return Boolean(DEFAULT_PLATFORM_SETTINGS.features[flag]);
  }
  return Boolean(features[flag]);
}

export function isMaintenanceMode(): boolean {
  return getStoredSettings().general.maintenanceMode;
}

/** Resolve public branding for layouts/metadata without exposing secrets. */
export function getPublicBrandConfig() {
  const s = getStoredSettings();
  return {
    platformName: s.general.platformName,
    companyName: s.general.companyName,
    contactEmail: s.general.contactEmail,
    supportEmail: s.general.supportEmail,
    websiteUrl: s.general.websiteUrl,
    locations: s.general.primaryLocations,
    socialHandle: s.general.socialHandle,
    socialLinks: s.general.socialLinks,
    footerText: s.general.footerText,
    logoUrl: s.branding.logoUrl,
    darkLogoUrl: s.branding.darkLogoUrl,
    faviconUrl: s.branding.faviconUrl,
    openGraphImageUrl: s.branding.openGraphImageUrl,
    primaryColor: s.branding.primaryColor,
    accentColor: s.branding.accentColor,
    language: s.localization.language,
    englishOnly: s.localization.englishOnly,
    metaDescription:
      s.general.footerText || "Professional Aviation Education Platform for ATPL Training.",
    pending: {
      brandGuidelines: s.branding.brandGuidelinesPending,
      colorPalette: s.branding.colorPalettePending,
      typography: s.branding.typographyPending,
      styleGuide: s.branding.styleGuidePending,
    },
    features: s.features,
  };
}
