/**
 * CGI / ATPL journey durable store (.data/aep-cgi.json).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-cgi.json");

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

let cache: CgiDatabase | null = null;

export function readCgiDb(): CgiDatabase {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as CgiDatabase;
      cache = {
        ...emptyDb(),
        ...parsed,
        settings: { ...defaultSettings(), ...(parsed.settings ?? {}) },
        subjectAssignments: parsed.subjectAssignments ?? [],
        lectureAssignments: parsed.lectureAssignments ?? [],
        notes: parsed.notes ?? [],
        audit: parsed.audit ?? [],
      };
      return cache;
    }
  } catch {
    // fall through
  }
  cache = emptyDb();
  return cache;
}

export function writeCgiDb(mutator: (db: CgiDatabase) => void): CgiDatabase {
  const db = structuredClone(readCgiDb());
  mutator(db);
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  cache = db;
  return db;
}

export function resetCgiDbCache(): void {
  cache = null;
}
