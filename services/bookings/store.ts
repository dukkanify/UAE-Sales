/**
 * Booking durable store (.data/aep-bookings.json).
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type { AppointmentBooking, BookingSettings } from "@/types/bookings";

export interface BookingsDatabase {
  settings: BookingSettings;
  bookings: AppointmentBooking[];
  seeded: boolean;
}

const DATA_FILE = path.join(dataDir(), "aep-bookings.json");

export function defaultBookingSettings(): BookingSettings {
  const now = new Date().toISOString();
  return {
    enabled: true,
    allowGuestBooking: true,
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
        id: "st_coaching",
        name: "Private Coaching",
        description: "One-to-one theory coaching tailored to your progress.",
        durationMinutes: 60,
        active: true,
        priceAmountMinor: 25000,
        currency: "KWD",
        paymentRequired: true,
        instructorIds: [],
      },
      {
        id: "st_mock_exam",
        name: "Mock Exam",
        description: "Simulated ATPL exam under real conditions with expert feedback.",
        durationMinutes: 90,
        active: true,
        priceAmountMinor: 35000,
        currency: "KWD",
        paymentRequired: true,
        instructorIds: [],
      },
      {
        id: "st_interview",
        name: "Interview Preparation",
        description: "Airline and cadet interview coaching with structured practice.",
        durationMinutes: 60,
        active: true,
        priceAmountMinor: 30000,
        currency: "KWD",
        paymentRequired: true,
        instructorIds: [],
      },
      {
        id: "st_oral",
        name: "Oral Assessment",
        description: "Oral exam readiness review with a certified instructor.",
        durationMinutes: 45,
        active: true,
        priceAmountMinor: 20000,
        currency: "KWD",
        paymentRequired: true,
        instructorIds: [],
      },
      {
        id: "st_mentoring",
        name: "One-to-One Mentoring",
        description: "Personal mentoring for your aviation career path.",
        durationMinutes: 60,
        active: true,
        priceAmountMinor: 0,
        currency: "KWD",
        paymentRequired: false,
        instructorIds: [],
      },
      {
        id: "st_consultation",
        name: "Aviation Consultation",
        description: "Expert consultation on training, licensing, or career decisions.",
        durationMinutes: 30,
        active: true,
        priceAmountMinor: 15000,
        currency: "KWD",
        paymentRequired: true,
        instructorIds: [],
      },
    ],
    blackoutDates: [],
    timezone: "UTC",
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

function normalizeBookingSettings(raw: Partial<BookingSettings> | undefined): BookingSettings {
  const merged = { ...defaultBookingSettings(), ...(raw ?? {}) };
  // Public studio is Greenwich Mean Time — migrate legacy Kuwait default.
  if (!merged.timezone || merged.timezone === "Asia/Kuwait") {
    merged.timezone = "UTC";
  }
  if (!Array.isArray(merged.instructorIds)) merged.instructorIds = [];
  if (!Array.isArray(merged.blackoutDates)) merged.blackoutDates = [];
  if (!Array.isArray(merged.sessionTypes) || merged.sessionTypes.length === 0) {
    merged.sessionTypes = defaultBookingSettings().sessionTypes;
  } else {
    merged.sessionTypes = merged.sessionTypes.map((t) => ({
      ...t,
      priceAmountMinor: typeof t.priceAmountMinor === "number" ? t.priceAmountMinor : 0,
      currency: t.currency || "KWD",
      paymentRequired: Boolean(t.paymentRequired),
      instructorIds: Array.isArray(t.instructorIds) ? t.instructorIds : [],
    }));
  }
  return merged;
}

export function ensureBookingsStore(): BookingsDatabase {
  const raw = readJsonFile<Partial<BookingsDatabase>>(DATA_FILE, emptyDb);
  return {
    settings: normalizeBookingSettings(raw.settings),
    bookings: raw.bookings ?? [],
    seeded: Boolean(raw.seeded),
  };
}

export function readBookingsDb(): BookingsDatabase {
  return ensureBookingsStore();
}

export function writeBookingsDb(mutator: (db: BookingsDatabase) => void): BookingsDatabase {
  const db = ensureBookingsStore();
  mutator(db);
  writeJsonFile(DATA_FILE, db);
  return db;
}
