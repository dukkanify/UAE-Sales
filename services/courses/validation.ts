/**
 * Course input validation — prevent duplicate codes, empty titles, invalid dates.
 */

import {
  COURSE_DELIVERY_TYPES,
  COURSE_STATUSES,
  DIFFICULTY_LEVELS,
  ENROLLMENT_MODES,
  MAX_COURSE_CODE_LENGTH,
  MAX_COURSE_TITLE_LENGTH,
} from "@/constants/courses";
import type {
  CourseDeliveryType,
  CourseStatus,
  DifficultyLevel,
  EnrollmentMode,
} from "@/types/courses";

export class CourseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourseValidationError";
  }
}

export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "-");
}

export function assertCourseTitle(title: unknown): string {
  if (typeof title !== "string" || !title.trim()) {
    throw new CourseValidationError("Course title is required");
  }
  const t = title.trim();
  if (t.length > MAX_COURSE_TITLE_LENGTH) {
    throw new CourseValidationError(`Title must be ≤ ${MAX_COURSE_TITLE_LENGTH} characters`);
  }
  return t;
}

export function assertCourseCode(code: unknown): string {
  if (typeof code !== "string" || !code.trim()) {
    throw new CourseValidationError("Course code is required");
  }
  const c = normalizeCourseCode(code);
  if (c.length > MAX_COURSE_CODE_LENGTH) {
    throw new CourseValidationError(`Course code must be ≤ ${MAX_COURSE_CODE_LENGTH} characters`);
  }
  if (!/^[A-Z0-9][A-Z0-9._-]*$/.test(c)) {
    throw new CourseValidationError(
      "Course code must start with a letter or number and use A–Z, 0–9, ., _, or -",
    );
  }
  return c;
}

export function assertStatus(status: unknown): CourseStatus {
  if (typeof status !== "string" || !COURSE_STATUSES.includes(status as CourseStatus)) {
    throw new CourseValidationError("Invalid course status");
  }
  return status as CourseStatus;
}

export function assertDifficulty(value: unknown): DifficultyLevel {
  if (typeof value !== "string" || !DIFFICULTY_LEVELS.includes(value as DifficultyLevel)) {
    throw new CourseValidationError("Invalid difficulty level");
  }
  return value as DifficultyLevel;
}

export function assertEnrollmentMode(value: unknown): EnrollmentMode {
  if (typeof value !== "string" || !ENROLLMENT_MODES.includes(value as EnrollmentMode)) {
    throw new CourseValidationError("Invalid enrollment mode");
  }
  return value as EnrollmentMode;
}

export function assertDeliveryType(value: unknown): CourseDeliveryType {
  if (typeof value !== "string" || !COURSE_DELIVERY_TYPES.includes(value as CourseDeliveryType)) {
    throw new CourseValidationError("Invalid delivery type");
  }
  return value as CourseDeliveryType;
}

export function assertBooleanFlag(label: string, value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "boolean") {
    throw new CourseValidationError(`${label} must be a boolean`);
  }
  return value;
}

export function assertScheduledPublish(
  status: CourseStatus,
  scheduledPublishAt: string | null | undefined,
): string | null {
  if (status === "scheduled") {
    if (!scheduledPublishAt) {
      throw new CourseValidationError("Scheduled courses require a future publish date");
    }
    const t = Date.parse(scheduledPublishAt);
    if (Number.isNaN(t)) {
      throw new CourseValidationError("Invalid scheduled publish date");
    }
    if (t <= Date.now()) {
      throw new CourseValidationError("Scheduled publish date must be in the future");
    }
    return new Date(t).toISOString();
  }
  if (scheduledPublishAt) {
    const t = Date.parse(scheduledPublishAt);
    if (Number.isNaN(t)) {
      throw new CourseValidationError("Invalid scheduled publish date");
    }
    return new Date(t).toISOString();
  }
  return null;
}

export function assertNonEmptyTitle(label: string, title: unknown): string {
  if (typeof title !== "string" || !title.trim()) {
    throw new CourseValidationError(`${label} title is required`);
  }
  return title.trim();
}
