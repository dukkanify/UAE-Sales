/**
 * Durable platform settings store (.data/aep-settings.json).
 * Mirrors auth store pattern; production maps to public.settings via Supabase.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { PlatformSettings, SettingChangeRecord } from "@/types/settings";
import { DEFAULT_PLATFORM_SETTINGS } from "@/services/settings/defaults";
import { generateId } from "@/lib/security/crypto";

interface SettingsDatabase {
  settings: PlatformSettings;
  history: SettingChangeRecord[];
  seeded: boolean;
}

const DATA_FILE = path.join(dataDir(), "aep-settings.json");
/** Keep settings history tiny — full before/after snapshots previously ballooned to ~2MB. */
const MAX_SETTINGS_HISTORY = 40;

function slimHistoryEntry(entry: SettingChangeRecord): SettingChangeRecord {
  const pickKeys = (value: unknown) => {
    if (!value || typeof value !== "object") return value;
    const settings = value as PlatformSettings;
    return {
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      branding: {
        primaryColor: settings.branding?.primaryColor,
        accentColor: settings.branding?.accentColor,
        logoUrl: settings.branding?.logoUrl,
      },
      courses: settings.courses,
      general: {
        platformName: settings.general?.platformName,
        maintenanceMode: settings.general?.maintenanceMode,
      },
    };
  };
  return {
    ...entry,
    before: pickKeys(entry.before),
    after: pickKeys(entry.after),
  };
}

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out = { ...base };
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof base[key] === "object" &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(
        base[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      ) as T[keyof T];
    } else if (value !== undefined) {
      out[key] = value as T[keyof T];
    }
  }
  return out;
}

function emptyDb(): SettingsDatabase {
  return {
    settings: {
      ...DEFAULT_PLATFORM_SETTINGS,
      updatedAt: new Date().toISOString(),
    },
    history: [],
    seeded: true,
  };
}

/** Upgrade persisted brand assets/colors to the official brand guidelines lockup. */
function migrateBrandingAssets(settings: PlatformSettings): PlatformSettings {
  const branding = { ...settings.branding };
  const target = {
    logoUrl: DEFAULT_PLATFORM_SETTINGS.branding.logoUrl,
    darkLogoUrl: DEFAULT_PLATFORM_SETTINGS.branding.darkLogoUrl,
    openGraphImageUrl: DEFAULT_PLATFORM_SETTINGS.branding.openGraphImageUrl,
    faviconUrl: DEFAULT_PLATFORM_SETTINGS.branding.faviconUrl,
  };
  let changed = false;
  for (const key of Object.keys(target) as (keyof typeof target)[]) {
    const current = branding[key];
    const next = target[key];
    if (current === next) continue;
    if (
      !current ||
      current.startsWith("/brand/") ||
      current.endsWith(".svg") ||
      /option-a-\d+/.test(current)
    ) {
      branding[key] = next;
      changed = true;
    }
  }
  const legacyPrimaries = new Set(["#0B1F33", "#0B1F3A", "#0b1f3a", "#2E7DAA", "#2e7daa"]);
  if (!branding.primaryColor || legacyPrimaries.has(branding.primaryColor)) {
    branding.primaryColor = DEFAULT_PLATFORM_SETTINGS.branding.primaryColor;
    changed = true;
  }
  const legacyAccents = new Set(["#DD9B30", "#dd9b30", "#38BDF8", "#38bdf8"]);
  if (!branding.accentColor || legacyAccents.has(branding.accentColor)) {
    branding.accentColor = DEFAULT_PLATFORM_SETTINGS.branding.accentColor;
    changed = true;
  }
  if (!branding.secondaryColor || branding.secondaryColor === "#4B5563") {
    branding.secondaryColor = DEFAULT_PLATFORM_SETTINGS.branding.secondaryColor;
    changed = true;
  }
  if (branding.typographyDisplay === "Space Grotesk") {
    branding.typographyDisplay = DEFAULT_PLATFORM_SETTINGS.branding.typographyDisplay;
    changed = true;
  }
  // Always prefer current lockup cache key (official PDF raster masters).
  for (const key of ["logoUrl", "darkLogoUrl", "faviconUrl", "openGraphImageUrl"] as const) {
    const current = branding[key];
    if (typeof current === "string" && /brand-guide-\d+/.test(current)) {
      const next = current.replace(/brand-guide-\d+/, "brand-guide-3");
      if (next !== current) {
        branding[key] = next;
        changed = true;
      }
    }
  }
  return changed ? { ...settings, branding } : settings;
}

function ensureStore(): SettingsDatabase {
  const raw = readJsonFile<Partial<SettingsDatabase>>(DATA_FILE, emptyDb);
  const settings = migrateBrandingAssets(
    deepMerge(
      DEFAULT_PLATFORM_SETTINGS as unknown as Record<string, unknown>,
      (raw.settings ?? emptyDb().settings) as unknown as Record<string, unknown>,
    ) as unknown as PlatformSettings,
  );
  const history = (raw.history ?? []).slice(0, MAX_SETTINGS_HISTORY).map(slimHistoryEntry);
  const db: SettingsDatabase = {
    settings,
    history,
    seeded: Boolean(raw.seeded ?? true),
  };

  // Persist a trimmed history once so cold starts stop re-parsing multi‑MB JSON.
  const rawHistoryLen = Array.isArray(raw.history) ? raw.history.length : 0;
  if (rawHistoryLen > MAX_SETTINGS_HISTORY) {
    writeJsonFile(DATA_FILE, db);
  }

  return db;
}

export function readSettingsDb(): SettingsDatabase {
  return ensureStore();
}

export function writeSettingsDb(mutator: (db: SettingsDatabase) => void): SettingsDatabase {
  const db = ensureStore();
  mutator(db);
  writeJsonFile(DATA_FILE, db);
  return db;
}

export function getStoredSettings(): PlatformSettings {
  return readSettingsDb().settings;
}

export function patchStoredSettings(
  patch: Partial<PlatformSettings>,
  actorId: string | null,
): PlatformSettings {
  let next: PlatformSettings = getStoredSettings();
  writeSettingsDb((db) => {
    const before = structuredClone(db.settings);
    db.settings = deepMerge(
      db.settings as unknown as Record<string, unknown>,
      patch as unknown as Record<string, unknown>,
    ) as unknown as PlatformSettings;
    db.settings.updatedAt = new Date().toISOString();
    db.settings.updatedBy = actorId;
    db.history.unshift(
      slimHistoryEntry({
        id: generateId(),
        category: "all",
        actorId,
        before,
        after: structuredClone(db.settings),
        createdAt: new Date().toISOString(),
      }),
    );
    if (db.history.length > MAX_SETTINGS_HISTORY) {
      db.history = db.history.slice(0, MAX_SETTINGS_HISTORY);
    }
    next = db.settings;
  });
  return next;
}
