/**
 * Instructor availability windows + blocks (CR005).
 */

import { generateId } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import { findUserById } from "@/services/auth/store";
import { readAssignmentDb, writeAssignmentDb } from "@/services/assignment/store";
import type { InstructorAvailabilityBlock, InstructorAvailabilityWindow } from "@/types/assignment";

export class AssignmentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AssignmentError";
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function assertInstructor(instructorId: string) {
  const user = findUserById(instructorId);
  if (!user || user.role !== ROLES.INSTRUCTOR) {
    throw new AssignmentError("Instructor not found", 404);
  }
  return user;
}

export function listAvailabilityWindows(instructorId?: string): InstructorAvailabilityWindow[] {
  return readAssignmentDb()
    .availabilityWindows.filter((w) => (instructorId ? w.instructorId === instructorId : true))
    .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
}

export function setAvailabilityWindows(input: {
  instructorId: string;
  windows: Array<{ weekday: number; startTime: string; endTime: string; timezone?: string }>;
}): InstructorAvailabilityWindow[] {
  assertInstructor(input.instructorId);
  const stamp = nowIso();
  const rows: InstructorAvailabilityWindow[] = input.windows.map((w) => {
    if (w.weekday < 0 || w.weekday > 6) {
      throw new AssignmentError("weekday must be 0–6");
    }
    if (!/^\d{1,2}:\d{2}$/.test(w.startTime) || !/^\d{1,2}:\d{2}$/.test(w.endTime)) {
      throw new AssignmentError("startTime/endTime must be HH:mm");
    }
    return {
      id: generateId(),
      instructorId: input.instructorId,
      weekday: w.weekday,
      startTime: w.startTime,
      endTime: w.endTime,
      timezone: w.timezone?.trim() || "UTC",
      active: true,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });

  writeAssignmentDb((db) => {
    db.availabilityWindows = db.availabilityWindows.filter(
      (w) => w.instructorId !== input.instructorId,
    );
    db.availabilityWindows.push(...rows);
  });
  return listAvailabilityWindows(input.instructorId);
}

export function addAvailabilityBlock(input: {
  instructorId: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}): InstructorAvailabilityBlock {
  assertInstructor(input.instructorId);
  const startsAt = new Date(input.startsAt).toISOString();
  const endsAt = new Date(input.endsAt).toISOString();
  if (!(Date.parse(endsAt) > Date.parse(startsAt))) {
    throw new AssignmentError("Block end must be after start");
  }
  const row: InstructorAvailabilityBlock = {
    id: generateId(),
    instructorId: input.instructorId,
    startsAt,
    endsAt,
    reason: input.reason?.trim() || "Unavailable",
    createdAt: nowIso(),
  };
  writeAssignmentDb((db) => {
    db.availabilityBlocks.unshift(row);
  });
  return row;
}

export function listAvailabilityBlocks(instructorId?: string): InstructorAvailabilityBlock[] {
  return readAssignmentDb()
    .availabilityBlocks.filter((b) => (instructorId ? b.instructorId === instructorId : true))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** Seed Mon–Thu 09:00–17:00 UTC when an instructor has no windows. */
export function ensureDefaultAvailability(instructorId: string): InstructorAvailabilityWindow[] {
  const existing = listAvailabilityWindows(instructorId);
  if (existing.length) return existing;
  return setAvailabilityWindows({
    instructorId,
    windows: [1, 2, 3, 4].map((weekday) => ({
      weekday,
      startTime: "09:00",
      endTime: "17:00",
      timezone: "UTC",
    })),
  });
}
