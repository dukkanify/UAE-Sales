/**
 * Aviation media library store.
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { DEFAULT_MEDIA_LIBRARY_CATEGORIES } from "@/constants/media-library";
import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { MediaLibraryDatabase } from "@/types/media-library";

function dataFile() {
  return path.join(dataDir(), "aep-media-library.json");
}

function emptyDb(): MediaLibraryDatabase {
  return {
    categories: structuredClone(DEFAULT_MEDIA_LIBRARY_CATEGORIES),
    assets: [],
    seeded: true,
  };
}

function normalizeDb(raw: Partial<MediaLibraryDatabase>): MediaLibraryDatabase {
  const categories = [...(raw.categories ?? [])];
  const byId = new Map(categories.map((c) => [c.id, c]));
  for (const cat of DEFAULT_MEDIA_LIBRARY_CATEGORIES) {
    if (!byId.has(cat.id)) categories.push(cat);
  }
  categories.sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    ...emptyDb(),
    ...raw,
    categories,
    assets: raw.assets ?? [],
    seeded: raw.seeded !== undefined ? Boolean(raw.seeded) : true,
  };
}

function ensureStore(): MediaLibraryDatabase {
  const raw = readJsonFile<Partial<MediaLibraryDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readMediaLibraryDb(): MediaLibraryDatabase {
  return ensureStore();
}

export function writeMediaLibraryDb(
  mutator: (db: MediaLibraryDatabase) => void,
): MediaLibraryDatabase {
  const db = ensureStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
