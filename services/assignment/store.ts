/**
 * Instructor Assignment Engine durable store (.data/aep-assignment.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import {
  clearJsonFileCache,
  dataDir,
  readJsonFile,
  writeJsonFile,
} from "@/lib/data/json-file-store";
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

function dataFile() {
  return path.join(dataDir(), "aep-assignment.json");
}

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

function normalizeDb(raw: Partial<AssignmentDatabase>): AssignmentDatabase {
  return {
    ...emptyDb(),
    ...raw,
    settings: { ...defaultSettings(), ...(raw.settings ?? {}) },
    availabilityWindows: raw.availabilityWindows ?? [],
    availabilityBlocks: raw.availabilityBlocks ?? [],
    requests: raw.requests ?? [],
    queue: raw.queue ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function readAssignmentDb(): AssignmentDatabase {
  const raw = readJsonFile<Partial<AssignmentDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function writeAssignmentDb(mutator: (db: AssignmentDatabase) => void): AssignmentDatabase {
  const db = readAssignmentDb();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}

export function resetAssignmentDbCache(): void {
  clearJsonFileCache(dataFile());
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
