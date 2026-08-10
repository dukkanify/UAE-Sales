/**
 * Dynamic Schedule Management (CR008)
 * Facade over Live Classes + ATPL lecture assignments.
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { generateId } from "@/lib/security/crypto";
import { logActivity } from "@/services/auth/activity-log";
import { findUserById, readAuthDb } from "@/services/auth/store";
import {
  cancelLiveClass,
  canManageClass,
  computeRuntimeStatus,
  createLiveClass,
  getLiveClass,
  getLiveClassDetail,
  listLiveClasses,
  rescheduleLiveClass,
} from "@/services/classes/class-service";
import { listAttendance, upsertAttendance } from "@/services/classes/attendance-service";
import { listReminders, queueClassReminders } from "@/services/classes/reminder-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import { getCourseById } from "@/services/courses/course-service";
import { readCgiDb, writeCgiDb } from "@/services/cgi/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import type { AtplLectureAssignment } from "@/types/cgi";
import type {
  NextSessionInfo,
  ScheduleAudience,
  ScheduleBuilderInput,
  ScheduleOverview,
  ScheduleSession,
  ScheduleSource,
  TimelineEvent,
} from "@/types/schedule";

export class ScheduleError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ScheduleError";
    this.status = status;
  }
}

function userName(userId: string | null): string | null {
  if (!userId) return null;
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

function isAtplCourse(courseId: string | null | undefined): boolean {
  if (!courseId) return false;
  ensureCoursesSeeded();
  const course = readCoursesDb().courses.find((c) => c.id === courseId);
  if (!course) return false;
  const code = (course.code ?? "").toUpperCase();
  const tags = Array.isArray(course.tags) ? course.tags.map((t) => String(t).toLowerCase()) : [];
  return code.startsWith("ATPL") || tags.includes("atpl");
}

function lectureByLiveClassId(liveClassId: string): AtplLectureAssignment | undefined {
  return readCgiDb().lectureAssignments.find((l) => l.liveClassId === liveClassId);
}

function attendanceSummary(liveClassId: string) {
  const rows = listAttendance(liveClassId);
  return {
    present: rows.filter((r) => r.status === "present").length,
    late: rows.filter((r) => r.status === "late").length,
    absent: rows.filter((r) => r.status === "absent").length,
    excused: rows.filter((r) => r.status === "excused").length,
    total: rows.length,
  };
}

function toSession(liveClassId: string): ScheduleSession | null {
  const detail = getLiveClassDetail(liveClassId);
  if (!detail) return null;
  const lecture = lectureByLiveClassId(liveClassId);
  const source: ScheduleSource = lecture || isAtplCourse(detail.courseId) ? "atpl" : "live_course";
  return {
    id: detail.id,
    title: detail.title,
    description: detail.description,
    source,
    courseId: detail.courseId,
    courseTitle: detail.courseTitle,
    courseCode: detail.courseCode,
    lessonId: detail.lessonId,
    instructorId: detail.instructorId,
    instructorName: detail.instructorName,
    startsAt: detail.startsAt,
    endsAt: detail.endsAt,
    durationMinutes: detail.durationMinutes,
    timezone: detail.timezone,
    status: detail.status,
    computedStatus: detail.computedStatus,
    recurringRuleId: detail.recurringRuleId,
    isRecurring: Boolean(detail.recurringRuleId || detail.parentClassId),
    parentClassId: detail.parentClassId,
    lectureAssignmentId: lecture?.id ?? null,
    zoomJoinUrl: detail.zoomJoinUrl,
    attendance: attendanceSummary(detail.id),
    enrolledCount: detail.enrolledCount,
  };
}

function visibleClassIds(options: {
  userId: string;
  role: string;
  courseId?: string;
  instructorId?: string;
  studentId?: string;
  source?: ScheduleSource | "all";
}): string[] {
  ensureClassesSeeded();
  const manageAll =
    options.role === ROLES.ADMIN ||
    options.role === ROLES.SUPER_ADMIN ||
    options.role === ROLES.CHIEF_GROUND_INSTRUCTOR;

  let rows = readClassesDb().classes.filter((c) => !c.deletedAt);

  if (options.courseId) rows = rows.filter((c) => c.courseId === options.courseId);
  if (options.instructorId) {
    rows = rows.filter(
      (c) =>
        c.instructorId === options.instructorId || c.assistantInstructorId === options.instructorId,
    );
  }

  if (!manageAll) {
    if (options.role === ROLES.INSTRUCTOR) {
      rows = rows.filter(
        (c) => c.instructorId === options.userId || c.assistantInstructorId === options.userId,
      );
    } else if (options.role === ROLES.STUDENT) {
      const myIds = new Set(
        readClassesDb()
          .participants.filter((p) => p.userId === options.userId && p.role === "participant")
          .map((p) => p.liveClassId),
      );
      rows = rows.filter((c) => myIds.has(c.id));
    }
  }

  if (options.studentId) {
    const sid = options.studentId;
    const studentClassIds = new Set(
      readClassesDb()
        .participants.filter((p) => p.userId === sid && p.role === "participant")
        .map((p) => p.liveClassId),
    );
    rows = rows.filter((c) => studentClassIds.has(c.id));
  }

  if (options.source && options.source !== "all") {
    rows = rows.filter((c) => {
      const source: ScheduleSource =
        lectureByLiveClassId(c.id) || isAtplCourse(c.courseId) ? "atpl" : "live_course";
      return source === options.source;
    });
  }

  return rows.map((c) => c.id);
}

export function listScheduleSessions(options: {
  userId: string;
  role: string;
  courseId?: string;
  instructorId?: string;
  studentId?: string;
  source?: ScheduleSource | "all";
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
}): ScheduleSession[] {
  const ids = visibleClassIds(options);
  let sessions = ids.map((id) => toSession(id)).filter((s): s is ScheduleSession => Boolean(s));

  if (options.from) {
    const from = Date.parse(options.from);
    sessions = sessions.filter((s) => Date.parse(s.endsAt) >= from);
  }
  if (options.to) {
    const to = Date.parse(options.to);
    sessions = sessions.filter((s) => Date.parse(s.startsAt) <= to);
  }
  if (options.status && options.status !== "all") {
    sessions = sessions.filter((s) => {
      if (options.status === "upcoming") return s.computedStatus === "upcoming";
      if (options.status === "live_now") return s.computedStatus === "live_now";
      return s.status === options.status || s.computedStatus === options.status;
    });
  }

  sessions.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const limit = options.limit ?? 100;
  return sessions.slice(0, limit);
}

export function getNextSession(options: {
  userId: string;
  role: string;
  instructorId?: string;
  studentId?: string;
}): NextSessionInfo {
  const upcoming = listScheduleSessions({
    ...options,
    status: "upcoming",
    from: new Date().toISOString(),
    limit: 1,
  });
  const session = upcoming[0] ?? null;
  const startsInMinutes = session
    ? Math.max(0, Math.round((Date.parse(session.startsAt) - Date.now()) / 60_000))
    : null;

  const reminders = session ? listReminders({ liveClassId: session.id, status: "pending" }) : [];
  const instructorIds = new Set(session ? [session.instructorId].filter(Boolean) : []);
  const participantRoles = session
    ? new Map(
        readClassesDb()
          .participants.filter((p) => p.liveClassId === session.id)
          .map((p) => [p.userId, p.role] as const),
      )
    : new Map<string, string>();

  let pendingStudentReminders = 0;
  let pendingInstructorReminders = 0;
  for (const r of reminders) {
    const role = participantRoles.get(r.userId);
    if (role === "host" || role === "cohost" || instructorIds.has(r.userId)) {
      pendingInstructorReminders += 1;
    } else {
      pendingStudentReminders += 1;
    }
  }

  return {
    session,
    startsInMinutes,
    pendingStudentReminders,
    pendingInstructorReminders,
  };
}

export function getScheduleTimeline(options: {
  userId: string;
  role: string;
  courseId?: string;
  instructorId?: string;
  studentId?: string;
  source?: ScheduleSource | "all";
  from?: string;
  to?: string;
  limit?: number;
}): TimelineEvent[] {
  const sessions = listScheduleSessions({
    ...options,
    // Pull a wide session window; event fan-out (reminders/attendance) is capped below.
    limit: Math.max(options.limit ?? 80, 300),
  });
  const events: TimelineEvent[] = [];

  for (const s of sessions) {
    events.push({
      id: `sess-${s.id}`,
      at: s.startsAt,
      kind:
        s.computedStatus === "live_now"
          ? "live"
          : s.status === "cancelled"
            ? "cancelled"
            : s.status === "rescheduled"
              ? "rescheduled"
              : s.status === "completed" || s.computedStatus === "completed"
                ? "completed"
                : "scheduled",
      title: s.title,
      detail: `${s.source === "atpl" ? "ATPL" : "Live"} · ${s.instructorName ?? "Instructor"} · ${s.computedStatus}`,
      liveClassId: s.id,
      source: s.source,
      status: s.computedStatus,
    });

    const reminders = listReminders({ liveClassId: s.id });
    for (const r of reminders) {
      const user = findUserById(r.userId);
      const isInstructor =
        user?.role === ROLES.INSTRUCTOR ||
        user?.role === ROLES.CHIEF_GROUND_INSTRUCTOR ||
        r.userId === s.instructorId;
      events.push({
        id: `rem-${r.id}`,
        at: r.scheduledFor,
        kind: isInstructor ? "reminder_instructor" : "reminder_student",
        title: `${isInstructor ? "Instructor" : "Student"} reminder (${r.kind})`,
        detail: `${s.title} · ${r.channel} · ${r.status}`,
        liveClassId: s.id,
        source: s.source,
        status: r.status,
      });
    }

    for (const a of listAttendance(s.id)) {
      if (a.status === "unknown") continue;
      events.push({
        id: `att-${a.id}`,
        at: a.updatedAt,
        kind: "attendance",
        title: `Attendance: ${a.status}`,
        detail: `${a.studentName ?? a.studentId} · ${s.title}`,
        liveClassId: s.id,
        source: s.source,
        status: a.status,
      });
    }
  }

  // Unscheduled ATPL lecture assignments (no live class yet)
  if (!options.source || options.source === "all" || options.source === "atpl") {
    let lectures = readCgiDb().lectureAssignments.filter((l) => !l.liveClassId);
    if (options.instructorId) {
      lectures = lectures.filter((l) => l.instructorId === options.instructorId);
    }
    if (options.studentId) {
      lectures = lectures.filter((l) => l.studentId === options.studentId);
    }
    if (options.role === ROLES.INSTRUCTOR) {
      lectures = lectures.filter((l) => l.instructorId === options.userId);
    }
    if (options.courseId) {
      lectures = lectures.filter((l) => l.courseId === options.courseId);
    }
    for (const l of lectures) {
      events.push({
        id: `lec-${l.id}`,
        at: l.scheduledAt ?? l.createdAt,
        kind: "lecture_assigned",
        title: l.lessonTitle,
        detail: `ATPL lecture assigned · ${userName(l.instructorId) ?? "Instructor"} · ${l.status}`,
        liveClassId: null,
        source: "atpl",
        status: l.status,
      });
    }
  }

  events.sort((a, b) => a.at.localeCompare(b.at));
  return events.slice(0, options.limit ?? 80);
}

export function getScheduleOverview(options: {
  userId: string;
  role: string;
  instructorId?: string;
  studentId?: string;
  source?: ScheduleSource | "all";
}): ScheduleOverview {
  const upcoming = listScheduleSessions({
    ...options,
    status: "upcoming",
    from: new Date().toISOString(),
    limit: 12,
  });
  const all = listScheduleSessions({ ...options, limit: 500 });
  const recurringSeries = new Set(
    all.filter((s) => s.recurringRuleId).map((s) => s.recurringRuleId),
  ).size;

  return {
    nextSession: getNextSession(options),
    upcoming,
    timeline: getScheduleTimeline({
      ...options,
      from: new Date(Date.now() - 7 * 86_400_000).toISOString(),
      limit: 40,
    }),
    stats: {
      upcoming: all.filter((s) => s.computedStatus === "upcoming").length,
      liveNow: all.filter((s) => s.computedStatus === "live_now").length,
      completed: all.filter((s) => s.status === "completed" || s.computedStatus === "completed")
        .length,
      cancelled: all.filter((s) => s.status === "cancelled").length,
      recurringSeries,
    },
  };
}

export function getSessionStatus(liveClassId: string) {
  const cls = getLiveClass(liveClassId);
  if (!cls) throw new ScheduleError("Session not found", 404);
  return {
    id: cls.id,
    status: cls.status,
    computedStatus: computeRuntimeStatus(cls),
    startsAt: cls.startsAt,
    endsAt: cls.endsAt,
    cancelledAt: cls.cancelledAt,
    cancelReason: cls.cancelReason,
    rescheduledFromId: cls.rescheduledFromId,
  };
}

/** Schedule Builder — create session (+ optional recurrence + ATPL link). */
export async function buildSchedule(input: ScheduleBuilderInput) {
  const instructor = findUserById(input.instructorId);
  if (!instructor || instructor.role !== ROLES.INSTRUCTOR) {
    throw new ScheduleError("Instructor not found", 404);
  }

  const course = input.courseId ? getCourseById(input.courseId) : null;
  if (input.courseId && !course) throw new ScheduleError("Course not found", 404);

  const created = await createLiveClass({
    title: input.title,
    description: input.description,
    courseId: input.courseId ?? null,
    lessonId: input.lessonId ?? null,
    instructorId: input.instructorId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    durationMinutes: input.durationMinutes,
    timezone: input.timezone,
    maxStudents: input.maxStudents,
    recurrence: input.recurrence,
    enrollStudentIds: input.studentIds,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  if (!created) throw new ScheduleError("Failed to create session", 500);

  let lectureAssignmentId: string | null = null;
  const shouldLinkAtpl =
    input.linkAtplLecture !== false && Boolean(input.courseId) && isAtplCourse(input.courseId);

  if (shouldLinkAtpl && input.courseId) {
    const stamp = new Date().toISOString();
    const studentId = input.studentIds?.[0] ?? null;
    const row: AtplLectureAssignment = {
      id: generateId(),
      courseId: input.courseId,
      lessonId: input.lessonId ?? `lesson-${created.id}`,
      lessonTitle: (input.lessonTitle ?? input.title).trim() || created.title,
      instructorId: input.instructorId,
      studentId,
      status: "scheduled",
      scheduledAt: created.startsAt,
      liveClassId: created.id,
      notes: null,
      assignedById: input.actorId,
      createdAt: stamp,
      updatedAt: stamp,
    };
    writeCgiDb((db) => {
      db.lectureAssignments.unshift(row);
    });
    lectureAssignmentId = row.id;

    // Link sibling occurrences in the recurring series
    if (created.recurringRuleId) {
      const siblings = readClassesDb().classes.filter(
        (c) => !c.deletedAt && c.recurringRuleId === created.recurringRuleId && c.id !== created.id,
      );
      for (const sib of siblings) {
        const sibRow: AtplLectureAssignment = {
          ...row,
          id: generateId(),
          liveClassId: sib.id,
          scheduledAt: sib.startsAt,
          createdAt: stamp,
          updatedAt: stamp,
        };
        writeCgiDb((db) => {
          db.lectureAssignments.unshift(sibRow);
        });
      }
    }
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_CREATED,
    entityType: "schedule_session",
    entityId: created.id,
    metadata: {
      source: shouldLinkAtpl ? "atpl" : "live_course",
      lectureAssignmentId,
      recurring: Boolean(created.recurringRuleId),
    },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const session = toSession(created.id);
  return {
    session,
    lectureAssignmentId,
    occurrences: created.recurringRuleId
      ? listLiveClasses({ pageSize: 100 }).data.filter(
          (c) => c.recurringRuleId === created.recurringRuleId,
        ).length
      : 1,
  };
}

/**
 * Ensure an ATPL lecture assignment has a LiveClass (Zoom + reminders).
 * Used when distributeLecture provides scheduledAt.
 */
export async function ensureLiveClassForLecture(input: {
  lectureId: string;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const lecture = readCgiDb().lectureAssignments.find((l) => l.id === input.lectureId);
  if (!lecture) throw new ScheduleError("Lecture assignment not found", 404);
  if (lecture.liveClassId) {
    const existing = toSession(lecture.liveClassId);
    if (existing) return existing;
  }
  if (!lecture.scheduledAt) {
    throw new ScheduleError("Lecture has no scheduled time", 400);
  }

  const created = await createLiveClass({
    title: lecture.lessonTitle,
    description: lecture.notes ?? "",
    courseId: lecture.courseId,
    lessonId: lecture.lessonId,
    instructorId: lecture.instructorId,
    startsAt: lecture.scheduledAt,
    durationMinutes: 60,
    enrollStudentIds: lecture.studentId ? [lecture.studentId] : undefined,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  if (!created) throw new ScheduleError("Failed to create live class for lecture", 500);

  writeCgiDb((db) => {
    const idx = db.lectureAssignments.findIndex((l) => l.id === lecture.id);
    if (idx >= 0) {
      db.lectureAssignments[idx] = {
        ...db.lectureAssignments[idx]!,
        liveClassId: created.id,
        status: "scheduled",
        scheduledAt: created.startsAt,
        updatedAt: new Date().toISOString(),
      };
    }
  });

  return toSession(created.id);
}

export async function rescheduleSession(input: {
  liveClassId: string;
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  actorId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  assertCanManage(input.actorId, input.actorRole, input.liveClassId);
  const result = await rescheduleLiveClass({
    id: input.liveClassId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    durationMinutes: input.durationMinutes,
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  if (!result) throw new ScheduleError("Reschedule failed", 500);

  writeCgiDb((db) => {
    for (const lecture of db.lectureAssignments) {
      if (lecture.liveClassId === input.liveClassId) {
        lecture.liveClassId = result.id;
        lecture.scheduledAt = input.startsAt;
        lecture.status = "scheduled";
        lecture.updatedAt = new Date().toISOString();
      }
    }
  });

  return toSession(result.id);
}

export async function cancelSession(input: {
  liveClassId: string;
  reason?: string;
  series?: boolean;
  actorId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  assertCanManage(input.actorId, input.actorRole, input.liveClassId);
  const cls = getLiveClass(input.liveClassId);
  if (!cls) throw new ScheduleError("Session not found", 404);

  const ids = new Set<string>([input.liveClassId]);
  if (input.series && cls.recurringRuleId) {
    for (const c of readClassesDb().classes) {
      if (
        !c.deletedAt &&
        c.recurringRuleId === cls.recurringRuleId &&
        !["cancelled", "completed", "rescheduled"].includes(c.status)
      ) {
        ids.add(c.id);
      }
    }
  }

  const cancelled = [];
  for (const id of ids) {
    const row = await cancelLiveClass({
      id,
      reason: input.reason,
      actorId: input.actorId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    writeCgiDb((db) => {
      for (const lecture of db.lectureAssignments) {
        if (lecture.liveClassId === id) {
          lecture.status = "cancelled";
          lecture.updatedAt = new Date().toISOString();
        }
      }
    });
    cancelled.push(row);
  }

  return {
    cancelledCount: cancelled.length,
    sessions: cancelled.map((c) => (c ? toSession(c.id) : null)).filter(Boolean),
  };
}

/** Queue reminders for students, instructors, or both. */
export async function queueAudienceReminders(
  liveClassId: string,
  audience: ScheduleAudience = "all",
): Promise<{ queued: number; audience: ScheduleAudience }> {
  const cls = getLiveClass(liveClassId);
  if (!cls) throw new ScheduleError("Session not found", 404);

  // Start from full queue, then cancel audience we don't want
  const created = await queueClassReminders(liveClassId);
  if (audience === "all") {
    return { queued: created.length, audience };
  }

  writeClassesDb((d) => {
    d.reminders = d.reminders.map((r) => {
      if (r.liveClassId !== liveClassId || r.status !== "pending") return r;
      const participant = d.participants.find(
        (p) => p.liveClassId === liveClassId && p.userId === r.userId,
      );
      const isInstructor =
        participant?.role === "host" ||
        participant?.role === "cohost" ||
        r.userId === cls.instructorId;
      if (audience === "instructor" && !isInstructor) {
        return { ...r, status: "cancelled" as const };
      }
      if (audience === "student" && isInstructor) {
        return { ...r, status: "cancelled" as const };
      }
      return r;
    });
  });

  const pending = listReminders({ liveClassId, status: "pending" });
  return { queued: pending.length, audience };
}

export async function sendImmediateAudienceReminder(input: {
  liveClassId: string;
  audience: ScheduleAudience;
  actorId: string;
}) {
  const cls = getLiveClass(input.liveClassId);
  if (!cls) throw new ScheduleError("Session not found", 404);

  const participants = readClassesDb().participants.filter(
    (p) => p.liveClassId === input.liveClassId,
  );
  const targets = participants.filter((p) => {
    const isInstructor = p.role === "host" || p.role === "cohost" || p.userId === cls.instructorId;
    if (input.audience === "all") return true;
    if (input.audience === "instructor") return isInstructor;
    return !isInstructor;
  });

  const { createNotification } = await import("@/services/notifications/notification-service");
  const label =
    input.audience === "instructor"
      ? "Instructor class reminder"
      : input.audience === "student"
        ? "Student class reminder"
        : "Class reminder";

  for (const p of targets) {
    await createNotification({
      userId: p.userId,
      title: label,
      body: `${cls.title} · ${new Date(cls.startsAt).toLocaleString()}`,
      type: `class.reminder.${input.audience}`,
      channel: "in_app",
      data: { liveClassId: cls.id, audience: input.audience },
    });
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.REMINDER_QUEUED,
    entityType: "live_class",
    entityId: cls.id,
    metadata: { audience: input.audience, count: targets.length, immediate: true },
  });

  return { notified: targets.length, audience: input.audience };
}

export async function markSessionAttendance(input: {
  liveClassId: string;
  studentId: string;
  status: Parameters<typeof upsertAttendance>[0]["status"];
  joinTime?: string | null;
  leaveTime?: string | null;
  notes?: string | null;
  actorId: string;
  actorRole: string;
}) {
  assertCanManage(input.actorId, input.actorRole, input.liveClassId);
  return upsertAttendance({
    liveClassId: input.liveClassId,
    studentId: input.studentId,
    status: input.status,
    joinTime: input.joinTime,
    leaveTime: input.leaveTime,
    notes: input.notes,
    actorId: input.actorId,
  });
}

export function listSessionAttendance(liveClassId: string) {
  if (!getLiveClass(liveClassId)) throw new ScheduleError("Session not found", 404);
  return listAttendance(liveClassId);
}

function assertCanManage(actorId: string, actorRole: string, liveClassId: string) {
  if (
    actorRole === ROLES.ADMIN ||
    actorRole === ROLES.SUPER_ADMIN ||
    actorRole === ROLES.CHIEF_GROUND_INSTRUCTOR
  ) {
    return;
  }
  if (!canManageClass(actorId, actorRole, liveClassId)) {
    throw new ScheduleError("Not allowed to manage this session", 403);
  }
}

export function assertScheduleAccess(role: string) {
  const allowed = [
    ROLES.STUDENT,
    ROLES.INSTRUCTOR,
    ROLES.CHIEF_GROUND_INSTRUCTOR,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
  ];
  if (!allowed.includes(role as (typeof allowed)[number])) {
    throw new ScheduleError("Schedule access denied", 403);
  }
}

export function canBuildSchedule(role: string): boolean {
  return (
    role === ROLES.INSTRUCTOR ||
    role === ROLES.CHIEF_GROUND_INSTRUCTOR ||
    role === ROLES.ADMIN ||
    role === ROLES.SUPER_ADMIN
  );
}
