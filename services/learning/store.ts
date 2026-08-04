/**
 * Student learning durable store (.data/aep-learning.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-learning.json");

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

export function ensureLearningStore(): LearningDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as LearningDatabase;
    return {
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
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readLearningDb(): LearningDatabase {
  return ensureLearningStore();
}

export function writeLearningDb(mutator: (db: LearningDatabase) => void): LearningDatabase {
  const db = ensureLearningStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
