/**
 * Mock exam availability — working hours + conflict-aware slots (CR007).
 */

import { ROLES } from "@/constants/roles";
import { readAuthDb } from "@/services/auth/store";
import { readBookingsDb } from "@/services/bookings/store";
import { rangesOverlap } from "@/services/classes/validation";
import { ensureMockExamsSeeded, readMockExamsDb } from "@/services/mock-exams/store";
import { MockExamError, quoteMockExam } from "@/services/mock-exams/pricing-service";
import type { MockExamSlot } from "@/types/mock-exams";

const ACTIVE = new Set(["pending_payment", "confirmed", "in_progress"]);

export function listMockExaminers() {
  ensureMockExamsSeeded();
  const settings = readMockExamsDb().settings;
  const instructors = readAuthDb().users.filter(
    (u) => u.role === ROLES.INSTRUCTOR && u.status === "active",
  );
  const pool = settings.examinerIds.length
    ? instructors.filter((u) => settings.examinerIds.includes(u.id))
    : instructors;
  return pool.map((u) => ({
    id: u.id,
    name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    email: u.email,
  }));
}

function isWithinWorkingHours(startsAt: Date, endsAt: Date): boolean {
  const settings = readMockExamsDb().settings;
  const weekday = startsAt.getUTCDay();
  const wh = settings.workingHours.find((w) => w.weekday === weekday && w.active);
  if (!wh) return false;
  const startMin = startsAt.getUTCHours() * 60 + startsAt.getUTCMinutes();
  const endMin = endsAt.getUTCHours() * 60 + endsAt.getUTCMinutes();
  return startMin >= wh.startHour * 60 && endMin <= wh.endHour * 60;
}

export function getMockExamSlots(input: {
  date: string;
  examinerId: string;
  examTypeId: string;
  selectedExtraFeeIds?: string[];
}): MockExamSlot[] {
  ensureMockExamsSeeded();
  const settings = readMockExamsDb().settings;
  if (!settings.enabled) return [];

  const exam = readMockExamsDb().examTypes.find((t) => t.id === input.examTypeId && t.active);
  if (!exam) throw new MockExamError("Exam type not available", 404);

  if (!listMockExaminers().some((e) => e.id === input.examinerId)) {
    throw new MockExamError("Examiner not available", 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new MockExamError("date must be yyyy-MM-dd");
  }
  if (settings.blackoutDates.includes(input.date)) return [];

  const dayStart = new Date(`${input.date}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (dayStart < today) return [];

  const max = new Date(today.getTime() + settings.maxAdvanceDays * 86_400_000);
  if (dayStart > max) return [];

  const duration = exam.durationMinutes;
  const step = settings.slotStepMinutes;
  const earliest = Date.now() + settings.minNoticeMinutes * 60_000;
  const sessions = readMockExamsDb().sessions.filter(
    (s) => s.examinerId === input.examinerId && ACTIVE.has(s.status),
  );

  let bookingBusy: Array<{ startsAt: string; endsAt: string }> = [];
  try {
    bookingBusy = readBookingsDb()
      .bookings.filter(
        (b) => b.instructorId === input.examinerId && ["pending", "confirmed"].includes(b.status),
      )
      .map((b) => ({ startsAt: b.startsAt, endsAt: b.endsAt }));
  } catch {
    bookingBusy = [];
  }

  const slots: MockExamSlot[] = [];
  for (let minute = 0; minute + duration <= 24 * 60; minute += step) {
    const startsAt = new Date(dayStart.getTime() + minute * 60_000);
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    const startsIso = startsAt.toISOString();
    const endsIso = endsAt.toISOString();

    if (startsAt.getTime() < earliest) {
      slots.push({ startsAt: startsIso, endsAt: endsIso, available: false, reason: "Too soon" });
      continue;
    }
    if (!isWithinWorkingHours(startsAt, endsAt)) {
      slots.push({
        startsAt: startsIso,
        endsAt: endsIso,
        available: false,
        reason: "Outside working hours",
      });
      continue;
    }

    const busy =
      sessions.some((s) => rangesOverlap(s.startsAt, s.endsAt, startsIso, endsIso)) ||
      bookingBusy.some((b) => rangesOverlap(b.startsAt, b.endsAt, startsIso, endsIso));

    if (busy) {
      slots.push({ startsAt: startsIso, endsAt: endsIso, available: false, reason: "Booked" });
      continue;
    }

    const quote = quoteMockExam({
      examTypeId: input.examTypeId,
      startsAt: startsIso,
      selectedExtraFeeIds: input.selectedExtraFeeIds,
    });
    slots.push({ startsAt: startsIso, endsAt: endsIso, available: true, quote });
  }

  return slots;
}
