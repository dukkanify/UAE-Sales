/**
 * Enrollment service — manual/bulk enroll, status transitions, transfer.
 * Progress foundation helpers (no learning-path business logic yet).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ENROLLMENT_STATUSES } from "@/constants/courses";
import { ROLES } from "@/constants/roles";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb } from "@/services/auth/store";
import { getCourseById } from "@/services/courses/course-service";
import { canAcceptEnrollment } from "@/services/courses/publishing";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb, writeCoursesDb } from "@/services/courses/store";
import { CourseValidationError } from "@/services/courses/validation";
import type {
  CourseProgressSummary,
  Enrollment,
  EnrollmentStatus,
  EnrollmentWithStudent,
  LessonProgress,
} from "@/types/courses";

function studentMeta(studentId: string) {
  const u = readAuthDb().users.find((x) => x.id === studentId);
  if (!u) return { studentName: null, studentEmail: null };
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return { studentName: name || u.email, studentEmail: u.email };
}

function assertStudent(studentId: string) {
  const u = readAuthDb().users.find((x) => x.id === studentId);
  if (!u) throw new CourseValidationError("Student not found");
  if (u.role !== ROLES.STUDENT) {
    throw new CourseValidationError("Only student accounts can be enrolled");
  }
  return u;
}

export function listEnrollments(courseId: string): EnrollmentWithStudent[] {
  ensureCoursesSeeded();
  return readCoursesDb()
    .enrollments.filter((e) => e.courseId === courseId)
    .map((e) => ({ ...e, ...studentMeta(e.studentId) }))
    .sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt));
}

export function listStudentEnrollments(studentId: string): EnrollmentWithStudent[] {
  ensureCoursesSeeded();
  return readCoursesDb()
    .enrollments.filter((e) => e.studentId === studentId)
    .map((e) => ({ ...e, ...studentMeta(e.studentId) }));
}

export async function enrollStudent(input: {
  courseId: string;
  studentId: string;
  status?: EnrollmentStatus;
  notes?: string | null;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** Paid / admin package enrollment — ignore public enrollment window. */
  bypassEnrollmentGate?: boolean;
}): Promise<EnrollmentWithStudent> {
  ensureCoursesSeeded();
  const course = getCourseById(input.courseId);
  if (!course) throw new CourseValidationError("Course not found");
  if (!input.bypassEnrollmentGate) {
    const enrollmentGate = canAcceptEnrollment(course);
    if (!enrollmentGate.ok) {
      throw new CourseValidationError(enrollmentGate.reason);
    }
  }
  assertStudent(input.studentId);

  const existing = readCoursesDb().enrollments.find(
    (e) =>
      e.courseId === input.courseId &&
      e.studentId === input.studentId &&
      !["dropped", "rejected"].includes(e.status),
  );
  if (existing) {
    throw new CourseValidationError("Student is already enrolled in this course");
  }

  const status = input.status ?? "approved";
  if (!ENROLLMENT_STATUSES.includes(status)) {
    throw new CourseValidationError("Invalid enrollment status");
  }

  const now = new Date().toISOString();
  const enrollment: Enrollment = {
    id: generateId(),
    courseId: input.courseId,
    studentId: input.studentId,
    status,
    enrolledById: input.actorId,
    enrolledAt: now,
    approvedAt: status === "approved" ? now : null,
    completedAt: status === "completed" ? now : null,
    droppedAt: null,
    suspendedAt: status === "suspended" ? now : null,
    notes: input.notes ?? null,
    updatedAt: now,
  };

  writeCoursesDb((d) => {
    d.enrollments.push(enrollment);
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.ENROLLMENT_CREATED,
    entityType: "enrollment",
    entityId: enrollment.id,
    metadata: { courseId: input.courseId, studentId: input.studentId, status },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ...enrollment, ...studentMeta(input.studentId) };
}

export async function bulkEnroll(input: {
  courseId: string;
  studentIds: string[];
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ enrolled: number; skipped: number }> {
  let enrolled = 0;
  let skipped = 0;
  for (const studentId of input.studentIds) {
    try {
      await enrollStudent({
        courseId: input.courseId,
        studentId,
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      enrolled += 1;
    } catch {
      skipped += 1;
    }
  }
  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.ENROLLMENT_BULK,
    entityType: "course",
    entityId: input.courseId,
    metadata: { enrolled, skipped },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  return { enrolled, skipped };
}

export async function updateEnrollmentStatus(input: {
  id: string;
  status: EnrollmentStatus;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<EnrollmentWithStudent> {
  ensureCoursesSeeded();
  if (!ENROLLMENT_STATUSES.includes(input.status)) {
    throw new CourseValidationError("Invalid enrollment status");
  }
  const existing = readCoursesDb().enrollments.find((e) => e.id === input.id);
  if (!existing) throw new CourseValidationError("Enrollment not found");

  const now = new Date().toISOString();
  const next: Enrollment = {
    ...existing,
    status: input.status,
    updatedAt: now,
    approvedAt: input.status === "approved" ? (existing.approvedAt ?? now) : existing.approvedAt,
    completedAt: input.status === "completed" ? now : existing.completedAt,
    droppedAt: input.status === "dropped" ? now : existing.droppedAt,
    suspendedAt: input.status === "suspended" ? now : existing.suspendedAt,
  };

  writeCoursesDb((d) => {
    const idx = d.enrollments.findIndex((e) => e.id === input.id);
    if (idx >= 0) d.enrollments[idx] = next;
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.ENROLLMENT_UPDATED,
    entityType: "enrollment",
    entityId: input.id,
    metadata: { from: existing.status, to: input.status },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return { ...next, ...studentMeta(next.studentId) };
}

export async function removeEnrollment(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  ensureCoursesSeeded();
  const existing = readCoursesDb().enrollments.find((e) => e.id === input.id);
  if (!existing) throw new CourseValidationError("Enrollment not found");

  // Soft-remove via dropped status to preserve history
  await updateEnrollmentStatus({
    id: input.id,
    status: "dropped",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.ENROLLMENT_REMOVED,
    entityType: "enrollment",
    entityId: input.id,
    metadata: { courseId: existing.courseId, studentId: existing.studentId },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export async function transferEnrollment(input: {
  id: string;
  targetCourseId: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<EnrollmentWithStudent> {
  ensureCoursesSeeded();
  const existing = readCoursesDb().enrollments.find((e) => e.id === input.id);
  if (!existing) throw new CourseValidationError("Enrollment not found");
  if (!getCourseById(input.targetCourseId)) {
    throw new CourseValidationError("Target course not found");
  }

  await updateEnrollmentStatus({
    id: input.id,
    status: "dropped",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return enrollStudent({
    courseId: input.targetCourseId,
    studentId: existing.studentId,
    status: "approved",
    notes: `Transferred from course ${existing.courseId}`,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

/** Progress foundation — compute summary from stored lesson progress rows. */
export function getProgressSummary(enrollmentId: string): CourseProgressSummary | null {
  ensureCoursesSeeded();
  const enrollment = readCoursesDb().enrollments.find((e) => e.id === enrollmentId);
  if (!enrollment) return null;
  const totalLessons = readCoursesDb().lessons.filter(
    (l) => l.courseId === enrollment.courseId,
  ).length;
  const rows = readCoursesDb().progress.filter((p) => p.enrollmentId === enrollmentId);
  const completedLessons = rows.filter((p) => p.completed).length;
  const timeSpentSeconds = rows.reduce((s, p) => s + p.timeSpentSeconds, 0);
  const lastAccessedAt =
    rows
      .map((p) => p.lastAccessedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
  const progressPercent =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  let completionStatus: CourseProgressSummary["completionStatus"] = "not_started";
  if (completedLessons > 0 && completedLessons < totalLessons) completionStatus = "in_progress";
  if (totalLessons > 0 && completedLessons >= totalLessons) completionStatus = "completed";

  return {
    enrollmentId,
    courseId: enrollment.courseId,
    studentId: enrollment.studentId,
    completedLessons,
    remainingLessons: Math.max(0, totalLessons - completedLessons),
    totalLessons,
    progressPercent,
    timeSpentSeconds,
    lastAccessedAt,
    completionStatus,
  };
}

/** Reserved writer for future learning runtime — not wired to UI yet. */
export function upsertLessonProgress(
  input: Omit<LessonProgress, "id" | "createdAt" | "updatedAt"> & { id?: string },
): LessonProgress {
  ensureCoursesSeeded();
  const now = new Date().toISOString();
  const existing = readCoursesDb().progress.find(
    (p) => p.enrollmentId === input.enrollmentId && p.lessonId === input.lessonId,
  );
  if (existing) {
    const next: LessonProgress = {
      ...existing,
      ...input,
      id: existing.id,
      updatedAt: now,
    };
    writeCoursesDb((d) => {
      const idx = d.progress.findIndex((p) => p.id === existing.id);
      if (idx >= 0) d.progress[idx] = next;
    });
    return next;
  }
  const row: LessonProgress = {
    id: input.id ?? generateId(),
    enrollmentId: input.enrollmentId,
    lessonId: input.lessonId,
    courseId: input.courseId,
    studentId: input.studentId,
    completed: input.completed,
    completedAt: input.completedAt,
    timeSpentSeconds: input.timeSpentSeconds,
    lastAccessedAt: input.lastAccessedAt,
    createdAt: now,
    updatedAt: now,
  };
  writeCoursesDb((d) => {
    d.progress.push(row);
  });
  return row;
}
