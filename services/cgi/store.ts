/**
 * CGI / ATPL journey durable store (.data/aep-cgi.json).
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
  AtplJourneySettings,
  AtplLectureAssignment,
  AtplSubjectAssignment,
  CgiAuditEvent,
  CgiOversightNote,
} from "@/types/cgi";

export interface CgiDatabase {
  settings: AtplJourneySettings;
  subjectAssignments: AtplSubjectAssignment[];
  lectureAssignments: AtplLectureAssignment[];
  notes: CgiOversightNote[];
  audit: CgiAuditEvent[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-cgi.json");
}

function defaultSettings(): AtplJourneySettings {
  return {
    defaultFirstSubjectCourseId: null,
    packageSku: "ATPL-PACKAGE",
    updatedAt: new Date().toISOString(),
    updatedById: null,
  };
}

function emptyDb(): CgiDatabase {
  return {
    settings: defaultSettings(),
    subjectAssignments: [],
    lectureAssignments: [],
    notes: [],
    audit: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<CgiDatabase>): CgiDatabase {
  return {
    ...emptyDb(),
    ...raw,
    settings: { ...defaultSettings(), ...(raw.settings ?? {}) },
    subjectAssignments: raw.subjectAssignments ?? [],
    lectureAssignments: raw.lectureAssignments ?? [],
    notes: raw.notes ?? [],
    audit: raw.audit ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function readCgiDb(): CgiDatabase {
  const raw = readJsonFile<Partial<CgiDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function writeCgiDb(mutator: (db: CgiDatabase) => void): CgiDatabase {
  const db = readCgiDb();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}

export function resetCgiDbCache(): void {
  clearJsonFileCache(dataFile());
}
