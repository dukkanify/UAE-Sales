/**
 * Live class validation + conflict detection helpers.
 */

import type { LiveClass, MeetingType } from "@/types/classes";
import { MEETING_TYPES } from "@/constants/classes";
import { readClassesDb } from "@/services/classes/store";

export class ClassValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassValidationError";
  }
}

export function assertTitle(title: unknown): string {
  if (typeof title !== "string" || !title.trim()) {
    throw new ClassValidationError("Class title is required");
  }
  return title.trim();
}

export function assertInstructorId(id: unknown): string {
  if (typeof id !== "string" || !id.trim()) {
    throw new ClassValidationError("Instructor is required");
  }
  return id.trim();
}

export function assertMeetingType(value: unknown): MeetingType {
  if (typeof value !== "string" || !MEETING_TYPES.includes(value as MeetingType)) {
    throw new ClassValidationError("Invalid meeting type");
  }
  return value as MeetingType;
}

export function assertTimeRange(startsAt: string, endsAt: string): void {
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new ClassValidationError("Invalid start or end time");
  }
  if (end <= start) {
    throw new ClassValidationError("End time must be after start time");
  }
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const as = Date.parse(aStart);
  const ae = Date.parse(aEnd);
  const bs = Date.parse(bStart);
  const be = Date.parse(bEnd);
  return as < be && bs < ae;
}

/**
 * Detect instructor double-booking and optional student overlaps.
 */
export function detectScheduleConflicts(input: {
  instructorId: string;
  startsAt: string;
  endsAt: string;
  excludeClassId?: string;
  studentIds?: string[];
}): { instructorConflict: LiveClass | null; studentConflicts: string[] } {
  const active = readClassesDb().classes.filter(
    (c) =>
      !c.deletedAt &&
      !["cancelled", "completed"].includes(c.status) &&
      c.id !== input.excludeClassId,
  );

  const instructorConflict =
    active.find(
      (c) =>
        (c.instructorId === input.instructorId ||
          c.assistantInstructorId === input.instructorId) &&
        rangesOverlap(c.startsAt, c.endsAt, input.startsAt, input.endsAt),
    ) ?? null;

  const studentConflicts: string[] = [];
  // Student conflict detection uses enrollment-linked classes via participants
  if (input.studentIds?.length) {
    const participants = readClassesDb().participants;
    for (const studentId of input.studentIds) {
      const classIds = participants
        .filter((p) => p.userId === studentId && p.role === "participant")
        .map((p) => p.liveClassId);
      const clash = active.find(
        (c) =>
          classIds.includes(c.id) &&
          rangesOverlap(c.startsAt, c.endsAt, input.startsAt, input.endsAt),
      );
      if (clash) studentConflicts.push(studentId);
    }
  }

  return { instructorConflict, studentConflicts };
}
