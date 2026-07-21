import { loadCollection, saveCollection } from "@/services/payments/data-store";

export type AdminSiteSettings = {
  platformFeePercent: number;
  gatewayFeePercent: number;
  gatewayFeeFixed: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  escrowHoldDays: number;
  supportEmail: string;
  stripeDashboardUrl: string;
  updatedAt: string;
};

const SETTINGS_FILE = "admin-settings.json";

const DEFAULT_SETTINGS: AdminSiteSettings = {
  platformFeePercent: 2.5,
  gatewayFeePercent: 2.9,
  gatewayFeeFixed: 1,
  maintenanceMode: false,
  allowGuestCheckout: true,
  escrowHoldDays: 7,
  supportEmail: "support@sooqna.site",
  stripeDashboardUrl: "https://dashboard.stripe.com",
  updatedAt: new Date().toISOString(),
};

let cached: AdminSiteSettings | null = null;

export async function getAdminSettings(): Promise<AdminSiteSettings> {
  if (cached) return cached;
  const rows = await loadCollection<AdminSiteSettings>(SETTINGS_FILE).catch(
    () => [] as AdminSiteSettings[],
  );
  cached = rows[0] ? { ...DEFAULT_SETTINGS, ...rows[0] } : { ...DEFAULT_SETTINGS };
  return cached;
}

/** Sync snapshot for fee calculator — falls back to defaults until hydrated. */
export function getAdminSettingsSync(): AdminSiteSettings {
  return cached ?? { ...DEFAULT_SETTINGS };
}

export async function updateAdminSettings(
  patch: Partial<Omit<AdminSiteSettings, "updatedAt">>,
): Promise<AdminSiteSettings> {
  const current = await getAdminSettings();
  const next: AdminSiteSettings = {
    ...current,
    ...patch,
    platformFeePercent: clampPercent(
      patch.platformFeePercent ?? current.platformFeePercent,
    ),
    gatewayFeePercent: clampPercent(
      patch.gatewayFeePercent ?? current.gatewayFeePercent,
    ),
    gatewayFeeFixed: Math.max(0, patch.gatewayFeeFixed ?? current.gatewayFeeFixed),
    escrowHoldDays: Math.max(1, Math.round(patch.escrowHoldDays ?? current.escrowHoldDays)),
    updatedAt: new Date().toISOString(),
  };
  cached = next;
  await saveCollection(SETTINGS_FILE, [next]);
  return next;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(30, Math.max(0, Math.round(value * 100) / 100));
}
