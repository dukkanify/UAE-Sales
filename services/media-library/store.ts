/**
 * Aviation media library store.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { DEFAULT_MEDIA_LIBRARY_CATEGORIES } from "@/constants/media-library";
import type { MediaLibraryDatabase } from "@/types/media-library";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-media-library.json");

function emptyDb(): MediaLibraryDatabase {
  return {
    categories: structuredClone(DEFAULT_MEDIA_LIBRARY_CATEGORIES),
    assets: [],
    seeded: true,
  };
}

function ensureStore(): MediaLibraryDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as MediaLibraryDatabase;
    // Ensure default categories exist; keep custom ones
    const byId = new Map(raw.categories.map((c) => [c.id, c]));
    for (const cat of DEFAULT_MEDIA_LIBRARY_CATEGORIES) {
      if (!byId.has(cat.id)) raw.categories.push(cat);
    }
    raw.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    return raw;
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readMediaLibraryDb(): MediaLibraryDatabase {
  return ensureStore();
}

export function writeMediaLibraryDb(
  mutator: (db: MediaLibraryDatabase) => void,
): MediaLibraryDatabase {
  const db = ensureStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
