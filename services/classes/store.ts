/**
 * Live classes durable store (.data/aep-classes.json).
 * Uses json-file-store so read-only hosts (Vercel) never 500 Server Components.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  AttendanceRecord,
  LiveClass,
  MeetingParticipant,
  MeetingRecording,
  ReminderQueueItem,
  RecurringRule,
  ZoomMeetingRecord,
} from "@/types/classes";

export interface ClassesDatabase {
  classes: LiveClass[];
  zoomMeetings: ZoomMeetingRecord[];
  recurringRules: RecurringRule[];
  attendance: AttendanceRecord[];
  participants: MeetingParticipant[];
  recordings: MeetingRecording[];
  reminders: ReminderQueueItem[];
  seeded: boolean;
}

function dataFile() {
  return path.join(dataDir(), "aep-classes.json");
}

function emptyDb(): ClassesDatabase {
  return {
    classes: [],
    zoomMeetings: [],
    recurringRules: [],
    attendance: [],
    participants: [],
    recordings: [],
    reminders: [],
    seeded: false,
  };
}

function normalizeDb(raw: Partial<ClassesDatabase>): ClassesDatabase {
  return {
    ...emptyDb(),
    ...raw,
    classes: raw.classes ?? [],
    zoomMeetings: raw.zoomMeetings ?? [],
    recurringRules: raw.recurringRules ?? [],
    attendance: raw.attendance ?? [],
    participants: raw.participants ?? [],
    recordings: raw.recordings ?? [],
    reminders: raw.reminders ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function ensureClassesStore(): ClassesDatabase {
  const raw = readJsonFile<Partial<ClassesDatabase>>(dataFile(), emptyDb);
  return normalizeDb(raw);
}

export function readClassesDb(): ClassesDatabase {
  return ensureClassesStore();
}

export function writeClassesDb(mutator: (db: ClassesDatabase) => void): ClassesDatabase {
  const db = ensureClassesStore();
  mutator(db);
  writeJsonFile(dataFile(), db);
  return db;
}
