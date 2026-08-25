/**
 * Student learning durable store (.data/aep-learning.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  Bookmark,
  Favorite,
  LearningHistoryEvent,
  LessonProgressRecord,
  OfflineCacheEntry,
  StudentNote,
  StudyGoal,
  StudySession,
} from "@/types/learning";

export interface LearningDatabase {
  progress: LessonProgressRecord[];
  notes: StudentNote[];
  bookmarks: Bookmark[];
  favorites: Favorite[];
  history: LearningHistoryEvent[];
  studySessions: StudySession[];
  goals: StudyGoal[];
  offlineCache: OfflineCacheEntry[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-learning.json");
}

function emptyDb(): LearningDatabase {
  return {
    progress: [],
    notes: [],
    bookmarks: [],
    favorites: [],
    history: [],
    studySessions: [],
    goals: [],
    offlineCache: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<LearningDatabase>): LearningDatabase {
  return {
    ...emptyDb(),
    ...raw,
    progress: raw.progress ?? [],
    notes: raw.notes ?? [],
    bookmarks: raw.bookmarks ?? [],
    favorites: raw.favorites ?? [],
    history: raw.history ?? [],
    studySessions: raw.studySessions ?? [],
    goals: raw.goals ?? [],
    offlineCache: raw.offlineCache ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureLearningStore(): LearningDatabase {
  const raw = readJsonFile<Partial<LearningDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readLearningDb(): LearningDatabase {
  return ensureLearningStore();
}

export function writeLearningDb(mutator: (db: LearningDatabase) => void): LearningDatabase {
  const db = ensureLearningStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
