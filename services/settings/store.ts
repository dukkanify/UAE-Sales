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

/** Upgrade persisted brand asset paths from legacy SVG masters to Option A PNGs. */
function migrateBrandingAssets(settings: PlatformSettings): PlatformSettings {
  const branding = { ...settings.branding };
  const target = {
    logoUrl: DEFAULT_PLATFORM_SETTINGS.branding.logoUrl,
    darkLogoUrl: DEFAULT_PLATFORM_SETTINGS.branding.darkLogoUrl,
    openGraphImageUrl: DEFAULT_PLATFORM_SETTINGS.branding.openGraphImageUrl,
  };
  let changed = false;
  for (const key of Object.keys(target) as (keyof typeof target)[]) {
    const current = branding[key];
    if (
      !current ||
      current.endsWith(".svg") ||
      current === "/brand/logo.png" ||
      current === "/brand/logo-dark.png" ||
      current === "/brand/og.png" ||
      // Bust stale Option A PNG query strings so clipped lockups refresh.
      /\/brand\/(logo|logo-dark|og)\.png(\?v=option-a-[12])?$/.test(current)
    ) {
      branding[key] = target[key];
      changed = true;
    }
  }
  if (!branding.primaryColor || branding.primaryColor.toUpperCase() === "#0B1F33") {
    branding.primaryColor = DEFAULT_PLATFORM_SETTINGS.branding.primaryColor;
    changed = true;
  }
  if (!branding.accentColor) {
    branding.accentColor = DEFAULT_PLATFORM_SETTINGS.branding.accentColor;
    changed = true;
  }
  if (!branding.secondaryColor) {
    branding.secondaryColor = DEFAULT_PLATFORM_SETTINGS.branding.secondaryColor;
    changed = true;
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
  return {
    settings,
    history: raw.history ?? [],
    seeded: Boolean(raw.seeded ?? true),
  };
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
    db.history.unshift({
      id: generateId(),
      category: "all",
      actorId,
      before,
      after: structuredClone(db.settings),
      createdAt: new Date().toISOString(),
    });
    if (db.history.length > 200) {
      db.history = db.history.slice(0, 200);
    }
    next = db.settings;
  });
  return next;
}
