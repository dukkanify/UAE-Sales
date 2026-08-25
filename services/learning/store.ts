/**
 * Student learning durable store (.data/aep-learning.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { agentLog } from "@/lib/debug/agent-log";
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
  // #region agent log
  agentLog({
    hypothesisId: "A",
    location: "learning/store.ts:ensureLearningStore",
    message: "ensureLearningStore entry",
    data: {
      dataDirExists: existsSync(DATA_DIR),
      dataFileExists: existsSync(DATA_FILE),
      cwd: process.cwd(),
    },
  });
  // #endregion
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DATA_FILE)) {
      const db = emptyDb();
      // #region agent log
      agentLog({
        hypothesisId: "A",
        location: "learning/store.ts:ensureLearningStore",
        message: "creating missing aep-learning.json",
        data: {},
      });
      // #endregion
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
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "A",
      location: "learning/store.ts:ensureLearningStore",
      message: "ensureLearningStore THREW",
      data: {
        code:
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "",
        errMessage: error instanceof Error ? error.message : String(error),
      },
    });
    // #endregion
    throw error;
  }
}

export function readLearningDb(): LearningDatabase {
  return ensureLearningStore();
}

export function writeLearningDb(mutator: (db: LearningDatabase) => void): LearningDatabase {
  const db = ensureLearningStore();
  mutator(db);
  // #region agent log
  agentLog({
    hypothesisId: "A",
    location: "learning/store.ts:writeLearningDb",
    message: "writeLearningDb before writeFileSync",
    data: { seeded: db.seeded, progressLen: db.progress.length },
  });
  // #endregion
  try {
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "A",
      location: "learning/store.ts:writeLearningDb",
      message: "writeLearningDb THREW",
      data: {
        code:
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "",
        errMessage: error instanceof Error ? error.message : String(error),
      },
    });
    // #endregion
    throw error;
  }
  return db;
}
