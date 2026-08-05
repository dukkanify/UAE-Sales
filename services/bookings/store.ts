/**
 * Booking durable store (.data/aep-bookings.json).
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

import type { AppointmentBooking, BookingSettings } from "@/types/bookings";

export interface BookingsDatabase {
  settings: BookingSettings;
  bookings: AppointmentBooking[];
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-bookings.json");

export function defaultBookingSettings(): BookingSettings {
  const now = new Date().toISOString();
  return {
    enabled: true,
    aroundTheClock: true,
    dayStartHour: 8,
    dayEndHour: 22,
    slotDurationMinutes: 60,
    bufferMinutes: 0,
    maxAdvanceDays: 30,
    minNoticeMinutes: 60,
    requireConfirmation: false,
    autoCreateZoom: true,
    zoomWaitingRoom: true,
    zoomPasscode: true,
    instructorIds: [],
    sessionTypes: [
      {
        id: "st_mentoring",
        name: "1:1 Mentoring",
        description: "Personal coaching with an instructor.",
        durationMinutes: 60,
        active: true,
      },
      {
        id: "st_exam_prep",
        name: "Exam prep",
        description: "Focused ATPL exam readiness session.",
        durationMinutes: 60,
        active: true,
      },
      {
        id: "st_office_hours",
        name: "Office hours",
        description: "Quick Q&A and progress check-in.",
        durationMinutes: 30,
        active: true,
      },
    ],
    blackoutDates: [],
    timezone: "Asia/Kuwait",
    updatedAt: now,
  };
}

function emptyDb(): BookingsDatabase {
  return {
    settings: defaultBookingSettings(),
    bookings: [],
    seeded: false,
  };
}

export function ensureBookingsStore(): BookingsDatabase {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<BookingsDatabase>;
    return {
      settings: { ...defaultBookingSettings(), ...(raw.settings ?? {}) },
      bookings: raw.bookings ?? [],
      seeded: Boolean(raw.seeded),
    };
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

export function readBookingsDb(): BookingsDatabase {
  return ensureBookingsStore();
}

export function writeBookingsDb(mutator: (db: BookingsDatabase) => void): BookingsDatabase {
  const db = ensureBookingsStore();
  mutator(db);
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  return db;
}
