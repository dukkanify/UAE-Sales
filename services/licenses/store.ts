/**
 * Commercial license JSON store — Super Admin restricted.
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { CommercialLicenseDatabase } from "@/types/licenses";

function dataFile() {
  return path.join(dataDir(), "aep-licenses.json");
}

function emptyDb(): CommercialLicenseDatabase {
  return { licenses: [], seeded: true };
}

function normalizeDb(raw: Partial<CommercialLicenseDatabase>): CommercialLicenseDatabase {
  return {
    ...emptyDb(),
    ...raw,
    licenses: raw.licenses ?? [],
    seeded: raw.seeded !== undefined ? Boolean(raw.seeded) : true,
  };
}

function ensureStore(): CommercialLicenseDatabase {
  const raw = readJsonFile<Partial<CommercialLicenseDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readLicensesDb(): CommercialLicenseDatabase {
  return ensureStore();
}

export function writeLicensesDb(
  mutator: (db: CommercialLicenseDatabase) => void,
): CommercialLicenseDatabase {
  const db = ensureStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
