/**
 * Chief Ground Instructor — ATPL journey orchestration (CR004).
 */

import { generateId } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import { findUserById, readAuthDb } from "@/services/auth/store";
import { assignInstructor } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import {
  listStudentEnrollments,
  updateEnrollmentStatus,
} from "@/services/courses/enrollment-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";
import { readPaymentsDb } from "@/services/payments/store";
import { rescheduleLiveClass, canManageClass } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb } from "@/services/classes/store";
import { readCgiDb, writeCgiDb } from "@/services/cgi/store";
import type {
  AtplLectureAssignment,
  AtplSubjectAssignment,
  AtplSubjectDistributionStatus,
  CgiOversightNote,
} from "@/types/cgi";

export class CgiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "CgiError";
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function audit(
  action: string,
  actorId: string | null,
  entityType: string,
  entityId: string | null,
  detail: string,
) {
  writeCgiDb((db) => {
    db.audit.unshift({
      id: generateId(),
      action,
      actorId,
      entityType,
      entityId,
      detail,
      createdAt: nowIso(),
    });
    db.audit = db.audit.slice(0, 500);
  });
}

export function listAtplCourses() {
  ensureCoursesSeeded();
  return readCoursesDb()
    .courses.filter((c) => !c.deletedAt && /^ATPL-/i.test(c.code))
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      primaryInstructorId: c.primaryInstructorId,
      status: c.status,
      subjectCode: typeof c.metadata?.subjectCode === "string" ? c.metadata.subjectCode : c.code,
    }));
}

export function getAtplPackageProduct() {
  ensurePaymentsSeeded();
  return readPaymentsDb().products.find((p) => p.metadata?.sku === "ATPL-PACKAGE") ?? null;
}

export function getJourneySettings() {
  return readCgiDb().settings;
}

export function setDefaultFirstSubject(input: {
  courseId: string;
  actorId: string;
}): ReturnType<typeof getJourneySettings> {
  const course = listAtplCourses().find((c) => c.id === input.courseId);
  if (!course) throw new CgiError("ATPL subject course not found", 404);

  writeCgiDb((db) => {
    db.settings.defaultFirstSubjectCourseId = input.courseId;
    db.settings.updatedAt = nowIso();
    db.settings.updatedById = input.actorId;
  });
  audit(
    "cgi.first_subject.default",
    input.actorId,
    "course",
    input.courseId,
    `Default first subject → ${course.code}`,
  );
  return getJourneySettings();
}

/** Ensure a student has an ordered ATPL subject distribution (seeded from package courses). */
export function ensureStudentSubjectPlan(
  studentId: string,
  actorId: string | null,
): AtplSubjectAssignment[] {
  const existing = readCgiDb().subjectAssignments.filter((a) => a.studentId === studentId);
  if (existing.length) return existing.sort((a, b) => a.sortOrder - b.sortOrder);

  const courses = listAtplCourses();
  if (!courses.length) return [];

  const settings = getJourneySettings();
  const firstId = settings.defaultFirstSubjectCourseId ?? courses[0]!.id;
  const ordered = [
    ...courses.filter((c) => c.id === firstId),
    ...courses.filter((c) => c.id !== firstId),
  ];

  const stamp = nowIso();
  const rows: AtplSubjectAssignment[] = ordered.map((c, idx) => ({
    id: generateId(),
    studentId,
    courseId: c.id,
    subjectCode: c.subjectCode,
    sortOrder: idx + 1,
    status: (idx === 0 ? "available" : "locked") as AtplSubjectDistributionStatus,
    assignedInstructorId: c.primaryInstructorId,
    unlockedAt: idx === 0 ? stamp : null,
    completedAt: null,
    notes: null,
    assignedById: actorId,
    createdAt: stamp,
    updatedAt: stamp,
  }));

  writeCgiDb((db) => {
    db.subjectAssignments.push(...rows);
  });
  audit("cgi.subjects.seed", actorId, "student", studentId, `Seeded ${rows.length} ATPL subjects`);
  return rows;
}

export function listStudentSubjectPlan(studentId: string): AtplSubjectAssignment[] {
  return readCgiDb()
    .subjectAssignments.filter((a) => a.studentId === studentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function distributeSubjects(input: {
  studentId: string;
  courseIds: string[];
  firstCourseId?: string | null;
  actorId: string;
}): AtplSubjectAssignment[] {
  const student = findUserById(input.studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw new CgiError("Student not found", 404);
  }
  const atpl = listAtplCourses();
  const byId = new Map(atpl.map((c) => [c.id, c]));
  for (const id of input.courseIds) {
    if (!byId.has(id)) throw new CgiError(`Not an ATPL subject: ${id}`);
  }

  const firstId = input.firstCourseId ?? input.courseIds[0] ?? null;
  if (firstId && !input.courseIds.includes(firstId)) {
    throw new CgiError("First subject must be included in the distribution list");
  }

  const ordered = firstId
    ? [firstId, ...input.courseIds.filter((id) => id !== firstId)]
    : [...input.courseIds];

  const stamp = nowIso();
  writeCgiDb((db) => {
    db.subjectAssignments = db.subjectAssignments.filter((a) => a.studentId !== input.studentId);
    ordered.forEach((courseId, idx) => {
      const course = byId.get(courseId)!;
      db.subjectAssignments.push({
        id: generateId(),
        studentId: input.studentId,
        courseId,
        subjectCode: course.subjectCode,
        sortOrder: idx + 1,
        status: idx === 0 ? "available" : "locked",
        assignedInstructorId: course.primaryInstructorId,
        unlockedAt: idx === 0 ? stamp : null,
        completedAt: null,
        notes: null,
        assignedById: input.actorId,
        createdAt: stamp,
        updatedAt: stamp,
      });
    });
  });

  audit(
    "cgi.subjects.distribute",
    input.actorId,
    "student",
    input.studentId,
    `Distributed ${ordered.length} subjects; first=${firstId ?? "n/a"}`,
  );
  return listStudentSubjectPlan(input.studentId);
}

export async function chooseFirstSubject(input: {
  studentId: string;
  courseId: string;
  actorId: string;
}): Promise<AtplSubjectAssignment[]> {
  let plan = listStudentSubjectPlan(input.studentId);
  if (!plan.length) {
    plan = ensureStudentSubjectPlan(input.studentId, input.actorId);
  }
  if (!plan.some((p) => p.courseId === input.courseId)) {
    throw new CgiError("Subject is not on this student's ATPL plan", 404);
  }

  const stamp = nowIso();
  writeCgiDb((db) => {
    const rows = db.subjectAssignments
      .filter((a) => a.studentId === input.studentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const target = rows.find((r) => r.courseId === input.courseId);
    if (!target) return;
    const rest = rows.filter((r) => r.id !== target.id);
    const reordered = [target, ...rest];
    reordered.forEach((row, idx) => {
      row.sortOrder = idx + 1;
      row.updatedAt = stamp;
      if (idx === 0) {
        if (row.status === "locked") row.status = "available";
        row.unlockedAt = row.unlockedAt ?? stamp;
      } else if (row.status === "available" && !row.completedAt) {
        row.status = "locked";
        row.unlockedAt = null;
      }
    });
  });

  // Unlock enrollment for first subject; suspend others that were auto-granted.
  const enrollments = listStudentEnrollments(input.studentId);
  for (const row of listStudentSubjectPlan(input.studentId)) {
    const enrollment = enrollments.find((e) => e.courseId === row.courseId);
    if (!enrollment) continue;
    if (row.sortOrder === 1 && enrollment.status === "suspended") {
      await updateEnrollmentStatus({
        id: enrollment.id,
        status: "approved",
        actorId: input.actorId,
      });
    } else if (row.sortOrder > 1 && row.status === "locked" && enrollment.status === "approved") {
      await updateEnrollmentStatus({
        id: enrollment.id,
        status: "suspended",
        actorId: input.actorId,
      });
    }
  }

  audit(
    "cgi.first_subject.student",
    input.actorId,
    "student",
    input.studentId,
    `First subject → ${input.courseId}`,
  );
  return listStudentSubjectPlan(input.studentId);
}

export async function changeSubjectInstructor(input: {
  courseId: string;
  instructorId: string;
  studentId?: string | null;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const instructor = findUserById(input.instructorId);
  if (!instructor || instructor.role !== ROLES.INSTRUCTOR) {
    throw new CgiError("Instructor not found", 404);
  }
  const course = listAtplCourses().find((c) => c.id === input.courseId);
  if (!course) throw new CgiError("ATPL subject not found", 404);

  await assignInstructor({
    courseId: input.courseId,
    userId: input.instructorId,
    role: "primary",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  writeCgiDb((db) => {
    for (const row of db.subjectAssignments) {
      if (row.courseId !== input.courseId) continue;
      if (input.studentId && row.studentId !== input.studentId) continue;
      row.assignedInstructorId = input.instructorId;
      row.updatedAt = nowIso();
    }
  });

  audit(
    "cgi.instructor.change",
    input.actorId,
    "course",
    input.courseId,
    `Primary instructor → ${instructor.email}`,
  );
  return listAtplCourses().find((c) => c.id === input.courseId)!;
}

export function distributeLecture(input: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  instructorId: string;
  studentId?: string | null;
  scheduledAt?: string | null;
  notes?: string | null;
  actorId: string;
}): AtplLectureAssignment {
  const instructor = findUserById(input.instructorId);
  if (!instructor || instructor.role !== ROLES.INSTRUCTOR) {
    throw new CgiError("Instructor not found", 404);
  }
  if (!listAtplCourses().some((c) => c.id === input.courseId)) {
    throw new CgiError("ATPL subject not found", 404);
  }

  const stamp = nowIso();
  const row: AtplLectureAssignment = {
    id: generateId(),
    courseId: input.courseId,
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle.trim() || "Lecture",
    instructorId: input.instructorId,
    studentId: input.studentId ?? null,
    status: input.scheduledAt ? "scheduled" : "assigned",
    scheduledAt: input.scheduledAt ?? null,
    liveClassId: null,
    notes: input.notes ?? null,
    assignedById: input.actorId,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCgiDb((db) => {
    db.lectureAssignments.unshift(row);
  });
  audit("cgi.lectures.distribute", input.actorId, "lecture", row.id, row.lessonTitle);
  return row;
}

export function listLectureAssignments(filters?: {
  instructorId?: string;
  studentId?: string;
  courseId?: string;
}): AtplLectureAssignment[] {
  return readCgiDb()
    .lectureAssignments.filter((row) => {
      if (filters?.instructorId && row.instructorId !== filters.instructorId) return false;
      if (filters?.studentId && row.studentId !== filters.studentId) return false;
      if (filters?.courseId && row.courseId !== filters.courseId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function rescheduleAtplClass(input: {
  liveClassId: string;
  startsAt: string;
  endsAt: string;
  actorId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  ensureClassesSeeded();
  // CGI may reschedule any class; instructors still limited by canManageClass.
  if (
    input.actorRole !== ROLES.CHIEF_GROUND_INSTRUCTOR &&
    input.actorRole !== ROLES.ADMIN &&
    input.actorRole !== ROLES.SUPER_ADMIN &&
    !canManageClass(input.actorId, input.actorRole, input.liveClassId)
  ) {
    throw new CgiError("Not allowed to reschedule this class", 403);
  }

  const result = await rescheduleLiveClass({
    id: input.liveClassId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  if (!result) throw new CgiError("Failed to reschedule live class", 500);

  writeCgiDb((db) => {
    for (const lecture of db.lectureAssignments) {
      if (lecture.liveClassId === input.liveClassId) {
        lecture.liveClassId = result.id;
        lecture.scheduledAt = input.startsAt;
        lecture.status = "scheduled";
        lecture.updatedAt = nowIso();
      }
    }
  });

  audit(
    "cgi.schedule.reschedule",
    input.actorId,
    "live_class",
    result.id,
    `Rescheduled from ${input.liveClassId}`,
  );
  return result;
}

export function listAtplStudents() {
  ensureCoursesSeeded();
  ensurePaymentsSeeded();
  const packageProduct = getAtplPackageProduct();
  const courseIds = new Set(
    (Array.isArray(packageProduct?.metadata?.courseIds)
      ? (packageProduct!.metadata.courseIds as string[])
      : listAtplCourses().map((c) => c.id)) as string[],
  );

  const auth = readAuthDb().users;
  const enrollments = readCoursesDb().enrollments.filter(
    (e) => courseIds.has(e.courseId) && !["dropped", "rejected"].includes(e.status),
  );
  const byStudent = new Map<string, typeof enrollments>();
  for (const e of enrollments) {
    const list = byStudent.get(e.studentId) ?? [];
    list.push(e);
    byStudent.set(e.studentId, list);
  }

  return [...byStudent.entries()]
    .map(([studentId, rows]) => {
      const user = auth.find((u) => u.id === studentId);
      const plan = listStudentSubjectPlan(studentId);
      const first = plan.find((p) => p.sortOrder === 1) ?? null;
      return {
        studentId,
        email: user?.email ?? "",
        name: user
          ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email
          : "Unknown",
        enrollmentCount: rows.length,
        firstSubjectCourseId: first?.courseId ?? null,
        firstSubjectCode: first?.subjectCode ?? null,
        planCount: plan.length,
        status: user?.status ?? "unknown",
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listAllInstructors() {
  ensureCoursesSeeded();
  ensureClassesSeeded();
  const instructors = readAuthDb().users.filter((u) => u.role === ROLES.INSTRUCTOR);
  const courses = readCoursesDb().courses.filter((c) => !c.deletedAt);
  const classes = readClassesDb().classes.filter((c) => !c.deletedAt);

  return instructors.map((u) => {
    const assignedCourses = courses.filter(
      (c) =>
        c.primaryInstructorId === u.id ||
        readCoursesDb().instructors.some((i) => i.courseId === c.id && i.userId === u.id),
    );
    const atplCourses = assignedCourses.filter((c) => /^ATPL-/i.test(c.code));
    const upcoming = classes.filter(
      (c) =>
        (c.instructorId === u.id || c.assistantInstructorId === u.id) &&
        c.status !== "cancelled" &&
        c.status !== "completed",
    ).length;
    return {
      instructorId: u.id,
      email: u.email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
      status: u.status,
      courseCount: assignedCourses.length,
      atplSubjectCount: atplCourses.length,
      upcomingClasses: upcoming,
      lectureAssignments: listLectureAssignments({ instructorId: u.id }).length,
    };
  });
}

export function addOversightNote(input: {
  targetType: "student" | "instructor";
  targetUserId: string;
  body: string;
  authorId: string;
}): CgiOversightNote {
  const body = input.body.trim();
  if (!body) throw new CgiError("Note body is required");
  const target = findUserById(input.targetUserId);
  if (!target) throw new CgiError("Target user not found", 404);

  const note: CgiOversightNote = {
    id: generateId(),
    targetType: input.targetType,
    targetUserId: input.targetUserId,
    body,
    authorId: input.authorId,
    createdAt: nowIso(),
  };
  writeCgiDb((db) => {
    db.notes.unshift(note);
  });
  return note;
}

export function listOversightNotes(targetUserId?: string): CgiOversightNote[] {
  return readCgiDb()
    .notes.filter((n) => (targetUserId ? n.targetUserId === targetUserId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCgiDashboardSnapshot() {
  const subjects = listAtplCourses();
  const students = listAtplStudents();
  const instructors = listAllInstructors();
  const lectures = listLectureAssignments();
  const settings = getJourneySettings();
  return {
    settings,
    subjectCount: subjects.length,
    studentCount: students.length,
    instructorCount: instructors.length,
    lectureAssignmentCount: lectures.length,
    defaultFirstSubjectCourseId: settings.defaultFirstSubjectCourseId,
    recentAudit: readCgiDb().audit.slice(0, 12),
    subjects,
    students: students.slice(0, 8),
    instructors,
  };
}
