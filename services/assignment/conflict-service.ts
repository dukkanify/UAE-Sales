/**
 * Unified conflict detection for the Instructor Assignment Engine (CR005).
 * Covers live classes, bookings, availability blocks, and weekly windows.
 */

import { rangesOverlap } from "@/services/classes/validation";
import { readClassesDb } from "@/services/classes/store";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readAssignmentDb } from "@/services/assignment/store";
import { readBookingsDb } from "@/services/bookings/store";
import type { ConflictHit, ConflictReport } from "@/types/assignment";

function readBookingsSafe(): Array<{
  id: string;
  instructorId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  title?: string;
}> {
  try {
    return readBookingsDb().bookings.map((a) => ({
      id: a.id,
      instructorId: a.instructorId,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      status: a.status,
      title: a.title || a.sessionTypeName || "Booking",
    }));
  } catch {
    return [];
  }
}

function parseHm(hm: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, m: min };
}

function isInsideWeeklyWindow(instructorId: string, startsAt: string, endsAt: string): boolean {
  const windows = readAssignmentDb().availabilityWindows.filter(
    (w) => w.instructorId === instructorId && w.active,
  );
  // No windows configured → treat as always available (open calendar).
  if (!windows.length) return true;

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;

  const weekday = start.getUTCDay();
  const dayWindows = windows.filter((w) => w.weekday === weekday);
  if (!dayWindows.length) return false;

  const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
  const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();

  return dayWindows.some((w) => {
    const from = parseHm(w.startTime);
    const to = parseHm(w.endTime);
    if (!from || !to) return false;
    const fromMin = from.h * 60 + from.m;
    const toMin = to.h * 60 + to.m;
    return startMin >= fromMin && endMin <= toMin;
  });
}

export function detectInstructorConflicts(input: {
  instructorId: string;
  startsAt: string;
  endsAt: string;
  excludeClassId?: string;
  excludeBookingId?: string;
}): ConflictReport {
  ensureClassesSeeded();
  const conflicts: ConflictHit[] = [];

  const classes = readClassesDb().classes.filter(
    (c) =>
      !c.deletedAt &&
      !["cancelled", "completed", "rescheduled"].includes(c.status) &&
      c.id !== input.excludeClassId &&
      (c.instructorId === input.instructorId || c.assistantInstructorId === input.instructorId),
  );

  for (const c of classes) {
    if (rangesOverlap(c.startsAt, c.endsAt, input.startsAt, input.endsAt)) {
      conflicts.push({
        source: "live_class",
        label: c.title,
        startsAt: c.startsAt,
        endsAt: c.endsAt,
        entityId: c.id,
      });
    }
  }

  for (const b of readBookingsSafe()) {
    if (b.instructorId !== input.instructorId) continue;
    if (b.id === input.excludeBookingId) continue;
    if (["cancelled", "completed", "no_show"].includes(b.status)) continue;
    if (rangesOverlap(b.startsAt, b.endsAt, input.startsAt, input.endsAt)) {
      conflicts.push({
        source: "booking",
        label: b.title ?? "Booking",
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        entityId: b.id,
      });
    }
  }

  for (const block of readAssignmentDb().availabilityBlocks) {
    if (block.instructorId !== input.instructorId) continue;
    if (rangesOverlap(block.startsAt, block.endsAt, input.startsAt, input.endsAt)) {
      conflicts.push({
        source: "availability_block",
        label: block.reason || "Blocked",
        startsAt: block.startsAt,
        endsAt: block.endsAt,
        entityId: block.id,
      });
    }
  }

  if (!isInsideWeeklyWindow(input.instructorId, input.startsAt, input.endsAt)) {
    conflicts.push({
      source: "outside_availability",
      label: "Outside instructor availability window",
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      entityId: null,
    });
  }

  return {
    instructorId: input.instructorId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    hasConflict: conflicts.length > 0,
    conflicts,
    available: conflicts.length === 0,
  };
}

export function summarizeConflicts(conflicts: ConflictHit[]): string {
  if (!conflicts.length) return "";
  return conflicts.map((c) => `${c.source}: ${c.label}`).join("; ");
}
