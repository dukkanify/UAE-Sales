/**
 * Instructor Assignment Engine durable store (.data/aep-assignment.json).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import type {
  AssignmentEngineSettings,
  AssignmentRequest,
  InstructorAvailabilityBlock,
  InstructorAvailabilityWindow,
  WaitingQueueItem,
} from "@/types/assignment";

export interface AssignmentDatabase {
  settings: AssignmentEngineSettings;
  availabilityWindows: InstructorAvailabilityWindow[];
  availabilityBlocks: InstructorAvailabilityBlock[];
  requests: AssignmentRequest[];
  queue: WaitingQueueItem[];
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-assignment.json");

function defaultSettings(): AssignmentEngineSettings {
  return {
    autoZoom: true,
    defaultDurationMinutes: 60,
    maxQueueAttempts: 5,
    lookAheadDays: 14,
    slotStepMinutes: 30,
    updatedAt: new Date().toISOString(),
  };
}

function emptyDb(): AssignmentDatabase {
  return {
    settings: defaultSettings(),
    availabilityWindows: [],
    availabilityBlocks: [],
    requests: [],
    queue: [],
    seeded: false,
  };
}

let cache: AssignmentDatabase | null = null;

export function readAssignmentDb(): AssignmentDatabase {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as AssignmentDatabase;
      cache = {
        ...emptyDb(),
        ...parsed,
        settings: { ...defaultSettings(), ...(parsed.settings ?? {}) },
        availabilityWindows: parsed.availabilityWindows ?? [],
        availabilityBlocks: parsed.availabilityBlocks ?? [],
        requests: parsed.requests ?? [],
        queue: parsed.queue ?? [],
      };
      return cache;
    }
  } catch {
    // fall through
  }
  cache = emptyDb();
  return cache;
}

export function writeAssignmentDb(mutator: (db: AssignmentDatabase) => void): AssignmentDatabase {
  const db = structuredClone(readAssignmentDb());
  mutator(db);
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  cache = db;
  return db;
}

export function resetAssignmentDbCache(): void {
  cache = null;
}

export function updateAssignmentEngineSettings(
  patch: Partial<AssignmentEngineSettings>,
): AssignmentEngineSettings {
  writeAssignmentDb((db) => {
    db.settings = {
      ...db.settings,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
  });
  return readAssignmentDb().settings;
}
