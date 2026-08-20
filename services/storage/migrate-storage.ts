import {
  LEGACY_STORAGE_KEYS,
  STORAGE_KEYS,
} from "@/shared/constants/brand";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function migrateKey(newKey: string, legacyKey: string) {
  if (!canUseStorage()) return;
  const current = window.localStorage.getItem(newKey);
  const legacy = window.localStorage.getItem(legacyKey);
  if (!current && legacy) {
    window.localStorage.setItem(newKey, legacy);
  }
  if (legacy) {
    window.localStorage.removeItem(legacyKey);
  }
}

/** Copy known `uae-sales-*` keys to `sooqna-*`, then drop the stale copies. */
export function ensureClientStorageMigrated() {
  if (!canUseStorage()) return;
  for (const key of Object.keys(STORAGE_KEYS) as (keyof typeof STORAGE_KEYS)[]) {
    migrateKey(STORAGE_KEYS[key], LEGACY_STORAGE_KEYS[key]);
  }
}
