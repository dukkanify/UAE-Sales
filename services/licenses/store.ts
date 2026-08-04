/**
 * Commercial license JSON store — Super Admin restricted.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type { CommercialLicenseDatabase } from "@/types/licenses";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-licenses.json");

function emptyDb(): CommercialLicenseDatabase {
  return { licenses: [], seeded: true };
}

function ensureStore(): CommercialLicenseDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as CommercialLicenseDatabase;
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readLicensesDb(): CommercialLicenseDatabase {
  return ensureStore();
}

export function writeLicensesDb(
  mutator: (db: CommercialLicenseDatabase) => void,
): CommercialLicenseDatabase {
  const db = ensureStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
