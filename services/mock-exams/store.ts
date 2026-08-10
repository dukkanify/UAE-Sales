/**
 * Mock Exam Booking durable store (.data/aep-mock-exams.json).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import type {
  MockExamCertificate,
  MockExamExtraFee,
  MockExamSettings,
  MockExamSession,
  MockExamType,
} from "@/types/mock-exams";

export interface MockExamsDatabase {
  settings: MockExamSettings;
  examTypes: MockExamType[];
  extraFees: MockExamExtraFee[];
  sessions: MockExamSession[];
  certificates: MockExamCertificate[];
  seeded: boolean;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-mock-exams.json");

export function defaultMockExamSettings(): MockExamSettings {
  const now = new Date().toISOString();
  return {
    enabled: true,
    currency: "KWD",
    timezone: "Asia/Kuwait",
    pricingMode: "dynamic",
    peakStartHour: 16,
    peakEndHour: 21,
    slotStepMinutes: 60,
    bufferMinutes: 15,
    maxAdvanceDays: 30,
    minNoticeMinutes: 120,
    autoCreateZoom: true,
    zoomWaitingRoom: true,
    zoomPasscode: true,
    autoIssueCertificate: true,
    examinerIds: [],
    workingHours: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      startHour: weekday === 5 || weekday === 6 ? 10 : 9,
      endHour: weekday === 5 || weekday === 6 ? 16 : 20,
      active: weekday !== 5, // Fri off by default
    })),
    blackoutDates: [],
    taxRatePercent: 0,
    updatedAt: now,
  };
}

function defaultExamTypes(): MockExamType[] {
  return [
    {
      id: "me_atpl_full",
      code: "ATPL-FULL",
      name: "ATPL Full Mock Exam",
      description: "Full timed ATPL theory mock under invigilation.",
      durationMinutes: 180,
      basePrice: 75_000, // 75.000 KWD in fils
      active: true,
      peakMultiplier: 1.25,
      offPeakMultiplier: 0.9,
    },
    {
      id: "me_atpl_subject",
      code: "ATPL-SUBJECT",
      name: "ATPL Subject Mock",
      description: "Single-subject ATPL mock exam session.",
      durationMinutes: 90,
      basePrice: 35_000,
      active: true,
      peakMultiplier: 1.2,
      offPeakMultiplier: 0.95,
    },
    {
      id: "me_progress",
      code: "PROGRESS",
      name: "Progress Check Mock",
      description: "Shorter progress-check mock with examiner feedback.",
      durationMinutes: 60,
      basePrice: 25_000,
      active: true,
      peakMultiplier: 1.15,
      offPeakMultiplier: 1,
    },
  ];
}

function defaultExtraFees(): MockExamExtraFee[] {
  return [
    {
      id: "fee_weekend",
      code: "WEEKEND",
      label: "Weekend surcharge",
      amount: 10_000,
      active: true,
      autoApply: false,
    },
    {
      id: "fee_rush",
      code: "RUSH",
      label: "Rush booking (< 48h)",
      amount: 15_000,
      active: true,
      autoApply: true,
    },
    {
      id: "fee_resit",
      code: "RESIT",
      label: "Resit fee",
      amount: 20_000,
      active: true,
      autoApply: false,
    },
    {
      id: "fee_cert_print",
      code: "CERT_PRINT",
      label: "Printed certificate courier",
      amount: 5_000,
      active: true,
      autoApply: false,
    },
  ];
}

function emptyDb(): MockExamsDatabase {
  return {
    settings: defaultMockExamSettings(),
    examTypes: defaultExamTypes(),
    extraFees: defaultExtraFees(),
    sessions: [],
    certificates: [],
    seeded: false,
  };
}

let cache: MockExamsDatabase | null = null;

export function readMockExamsDb(): MockExamsDatabase {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as MockExamsDatabase;
      cache = {
        settings: { ...defaultMockExamSettings(), ...(parsed.settings ?? {}) },
        examTypes: parsed.examTypes?.length ? parsed.examTypes : defaultExamTypes(),
        extraFees: parsed.extraFees?.length ? parsed.extraFees : defaultExtraFees(),
        sessions: parsed.sessions ?? [],
        certificates: parsed.certificates ?? [],
        seeded: Boolean(parsed.seeded),
      };
      return cache;
    }
  } catch {
    // fall through
  }
  cache = emptyDb();
  return cache;
}

export function writeMockExamsDb(mutator: (db: MockExamsDatabase) => void): MockExamsDatabase {
  const db = structuredClone(readMockExamsDb());
  mutator(db);
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  cache = db;
  return db;
}

export function resetMockExamsDbCache(): void {
  cache = null;
}

export function ensureMockExamsSeeded(): void {
  const db = readMockExamsDb();
  if (db.seeded) return;
  writeMockExamsDb((d) => {
    if (!d.examTypes.length) d.examTypes = defaultExamTypes();
    if (!d.extraFees.length) d.extraFees = defaultExtraFees();
    d.seeded = true;
    d.settings.updatedAt = new Date().toISOString();
  });
}
