/**
 * Live classes durable store (.data/aep-classes.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-classes.json");

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

export function ensureClassesStore(): ClassesDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as ClassesDatabase;
    return {
      classes: raw.classes ?? [],
      zoomMeetings: raw.zoomMeetings ?? [],
      recurringRules: raw.recurringRules ?? [],
      attendance: raw.attendance ?? [],
      participants: raw.participants ?? [],
      recordings: raw.recordings ?? [],
      reminders: raw.reminders ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readClassesDb(): ClassesDatabase {
  return ensureClassesStore();
}

export function writeClassesDb(mutator: (db: ClassesDatabase) => void): ClassesDatabase {
  const db = ensureClassesStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
