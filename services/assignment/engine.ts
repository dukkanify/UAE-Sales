/**
 * Instructor Assignment Engine — ATPL journey orchestration (CR005).
 *
 * Assign / reassign instructors, check availability + conflicts,
 * auto-create Zoom meetings, enqueue waiting requests, and surface
 * scheduling_required / unable_to_schedule outcomes.
 */

import { generateId } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import { findUserById, readAuthDb } from "@/services/auth/store";
import { assignInstructor, getCourseById } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import { createLiveClass, listLiveClasses } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import {
  AssignmentError,
  ensureDefaultAvailability,
  listAvailabilityBlocks,
  listAvailabilityWindows,
} from "@/services/assignment/availability-service";
import {
  detectInstructorConflicts,
  summarizeConflicts,
} from "@/services/assignment/conflict-service";
import { readAssignmentDb, writeAssignmentDb } from "@/services/assignment/store";
import { readBookingsDb } from "@/services/bookings/store";
import type {
  AssignmentRequest,
  InstructorCalendarEvent,
  ScheduleSessionResult,
  WaitingQueueItem,
} from "@/types/assignment";

export { AssignmentError };

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

function getRequest(id: string): AssignmentRequest | null {
  return readAssignmentDb().requests.find((r) => r.id === id) ?? null;
}

function bumpQueuePositions(instructorId: string) {
  writeAssignmentDb((db) => {
    const waiting = db.queue
      .filter((q) => q.instructorId === instructorId && q.status === "waiting")
      .sort((a, b) => a.priority - b.priority || a.enqueuedAt.localeCompare(b.enqueuedAt));
    waiting.forEach((q, idx) => {
      const req = db.requests.find((r) => r.id === q.assignmentRequestId);
      if (req) req.queuePosition = idx + 1;
    });
  });
}

export function listAssignmentRequests(filters?: {
  instructorId?: string;
  status?: string;
  courseId?: string;
}): AssignmentRequest[] {
  return readAssignmentDb()
    .requests.filter((r) => {
      if (filters?.instructorId && r.instructorId !== filters.instructorId) return false;
      if (filters?.status && r.status !== filters.status) return false;
      if (filters?.courseId && r.courseId !== filters.courseId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listWaitingQueue(instructorId?: string): WaitingQueueItem[] {
  return readAssignmentDb()
    .queue.filter((q) => {
      if (instructorId && q.instructorId !== instructorId) return false;
      return q.status === "waiting" || q.status === "processing";
    })
    .sort((a, b) => a.priority - b.priority || a.enqueuedAt.localeCompare(b.enqueuedAt));
}

/** Assign (or first-time set) primary instructor on an ATPL subject. */
export async function assignInstructorEngine(input: {
  courseId: string;
  instructorId: string;
  studentId?: string | null;
  lessonId?: string | null;
  lessonTitle?: string;
  preferredStartsAt?: string | null;
  durationMinutes?: number;
  autoZoom?: boolean;
  scheduleNow?: boolean;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<ScheduleSessionResult> {
  ensureCoursesSeeded();
  assertInstructor(input.instructorId);
  const course = getCourseById(input.courseId);
  if (!course) throw new AssignmentError("Course not found", 404);

  await assignInstructor({
    courseId: input.courseId,
    userId: input.instructorId,
    role: "primary",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  ensureDefaultAvailability(input.instructorId);
  const settings = readAssignmentDb().settings;
  const stamp = nowIso();
  const request: AssignmentRequest = {
    id: generateId(),
    kind: "assign",
    courseId: input.courseId,
    lessonId: input.lessonId ?? null,
    lessonTitle: input.lessonTitle?.trim() || `${course.code} session`,
    studentId: input.studentId ?? null,
    instructorId: input.instructorId,
    previousInstructorId: null,
    preferredStartsAt: input.preferredStartsAt ?? null,
    durationMinutes: input.durationMinutes ?? settings.defaultDurationMinutes,
    status: "scheduling_required",
    liveClassId: null,
    zoomMeetingId: null,
    conflictSummary: null,
    queuePosition: null,
    attempts: 0,
    maxAttempts: settings.maxQueueAttempts,
    autoZoom: input.autoZoom ?? settings.autoZoom,
    notes: null,
    createdById: input.actorId,
    createdAt: stamp,
    updatedAt: stamp,
    scheduledAt: null,
    unableReason: null,
  };

  writeAssignmentDb((db) => {
    db.requests.unshift(request);
  });

  if (input.scheduleNow || input.preferredStartsAt) {
    return scheduleAssignmentSession({
      requestId: request.id,
      startsAt: input.preferredStartsAt ?? undefined,
      actorId: input.actorId,
    });
  }

  return {
    request: getRequest(request.id)!,
    queueItem: null,
    liveClassId: null,
    zoomMeetingId: null,
    conflicts: [],
    outcome: "scheduling_required",
  };
}

/** Reassign instructor; future open classes move when possible. */
export async function reassignInstructorEngine(input: {
  courseId: string;
  instructorId: string;
  studentId?: string | null;
  moveFutureClasses?: boolean;
  actorId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{
  courseId: string;
  instructorId: string;
  previousInstructorId: string | null;
  movedClasses: number;
  queuedSessions: number;
  request: AssignmentRequest;
}> {
  ensureCoursesSeeded();
  ensureClassesSeeded();
  assertInstructor(input.instructorId);
  const course = getCourseById(input.courseId);
  if (!course) throw new AssignmentError("Course not found", 404);

  const previousInstructorId = course.primaryInstructorId;
  await assignInstructor({
    courseId: input.courseId,
    userId: input.instructorId,
    role: "primary",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  ensureDefaultAvailability(input.instructorId);

  const settings = readAssignmentDb().settings;
  const stamp = nowIso();
  const request: AssignmentRequest = {
    id: generateId(),
    kind: "reassign",
    courseId: input.courseId,
    lessonId: null,
    lessonTitle: `Reassign ${course.code}`,
    studentId: input.studentId ?? null,
    instructorId: input.instructorId,
    previousInstructorId,
    preferredStartsAt: null,
    durationMinutes: settings.defaultDurationMinutes,
    status: "scheduling_required",
    liveClassId: null,
    zoomMeetingId: null,
    conflictSummary: null,
    queuePosition: null,
    attempts: 0,
    maxAttempts: settings.maxQueueAttempts,
    autoZoom: settings.autoZoom,
    notes: previousInstructorId
      ? `Reassigned from ${previousInstructorId}`
      : "Initial assignment via reassign",
    createdById: input.actorId,
    createdAt: stamp,
    updatedAt: stamp,
    scheduledAt: null,
    unableReason: null,
  };
  writeAssignmentDb((db) => {
    db.requests.unshift(request);
  });

  let movedClasses = 0;
  let queuedSessions = 0;
  if (input.moveFutureClasses !== false && previousInstructorId) {
    const future = readClassesDb().classes.filter(
      (c) =>
        !c.deletedAt &&
        c.courseId === input.courseId &&
        c.instructorId === previousInstructorId &&
        !["cancelled", "completed", "rescheduled"].includes(c.status) &&
        Date.parse(c.startsAt) > Date.now(),
    );
    for (const cls of future) {
      const report = detectInstructorConflicts({
        instructorId: input.instructorId,
        startsAt: cls.startsAt,
        endsAt: cls.endsAt,
        excludeClassId: cls.id,
      });
      if (report.available) {
        writeClassesDb((d) => {
          const idx = d.classes.findIndex((x) => x.id === cls.id);
          if (idx >= 0) {
            d.classes[idx] = {
              ...d.classes[idx]!,
              instructorId: input.instructorId,
              updatedAt: nowIso(),
            };
          }
        });
        movedClasses += 1;
      } else {
        const result = await scheduleAssignmentSession({
          createRequest: {
            courseId: input.courseId,
            instructorId: input.instructorId,
            lessonTitle: cls.title,
            preferredStartsAt: cls.startsAt,
            durationMinutes: cls.durationMinutes,
            studentId: input.studentId,
            actorId: input.actorId,
          },
          startsAt: cls.startsAt,
          actorId: input.actorId,
        });
        if (result.outcome === "queued") queuedSessions += 1;
      }
    }
  }

  return {
    courseId: input.courseId,
    instructorId: input.instructorId,
    previousInstructorId,
    movedClasses,
    queuedSessions,
    request: getRequest(request.id)!,
  };
}

function findNextOpenSlot(input: {
  instructorId: string;
  durationMinutes: number;
  fromIso?: string;
}): string | null {
  const settings = readAssignmentDb().settings;
  const step = settings.slotStepMinutes;
  const lookAhead = settings.lookAheadDays;
  const cursor = new Date(input.fromIso ?? Date.now());
  cursor.setUTCSeconds(0, 0);
  const mins = cursor.getUTCMinutes();
  cursor.setUTCMinutes(mins + ((step - (mins % step)) % step));

  const deadline = Date.now() + lookAhead * 86_400_000;
  while (cursor.getTime() < deadline) {
    const startsAt = cursor.toISOString();
    const endsAt = new Date(cursor.getTime() + input.durationMinutes * 60_000).toISOString();
    const report = detectInstructorConflicts({
      instructorId: input.instructorId,
      startsAt,
      endsAt,
    });
    if (report.available) return startsAt;
    cursor.setTime(cursor.getTime() + step * 60_000);
  }
  return null;
}

function enqueueWaiting(input: {
  request: AssignmentRequest;
  preferredStartsAt: string | null;
}): WaitingQueueItem {
  const stamp = nowIso();
  const item: WaitingQueueItem = {
    id: generateId(),
    assignmentRequestId: input.request.id,
    instructorId: input.request.instructorId,
    courseId: input.request.courseId,
    preferredStartsAt: input.preferredStartsAt,
    durationMinutes: input.request.durationMinutes,
    priority: Date.now(),
    status: "waiting",
    enqueuedAt: stamp,
    updatedAt: stamp,
    lastCheckedAt: null,
    failureReason: null,
  };
  writeAssignmentDb((db) => {
    db.queue.unshift(item);
    const req = db.requests.find((r) => r.id === input.request.id);
    if (req) {
      req.status = "queued";
      req.updatedAt = stamp;
    }
  });
  bumpQueuePositions(input.request.instructorId);
  return readAssignmentDb().queue.find((q) => q.id === item.id)!;
}

export async function scheduleAssignmentSession(input: {
  requestId?: string;
  createRequest?: {
    courseId: string;
    instructorId: string;
    lessonId?: string | null;
    lessonTitle?: string;
    preferredStartsAt?: string | null;
    durationMinutes?: number;
    studentId?: string | null;
    actorId: string;
    autoZoom?: boolean;
  };
  startsAt?: string;
  actorId: string;
}): Promise<ScheduleSessionResult> {
  ensureClassesSeeded();
  ensureCoursesSeeded();
  const settings = readAssignmentDb().settings;
  let request = input.requestId ? getRequest(input.requestId) : null;

  if (!request && input.createRequest) {
    assertInstructor(input.createRequest.instructorId);
    ensureDefaultAvailability(input.createRequest.instructorId);
    const course = getCourseById(input.createRequest.courseId);
    if (!course) throw new AssignmentError("Course not found", 404);
    const stamp = nowIso();
    request = {
      id: generateId(),
      kind: "schedule_session",
      courseId: input.createRequest.courseId,
      lessonId: input.createRequest.lessonId ?? null,
      lessonTitle: input.createRequest.lessonTitle?.trim() || `${course.code} session`,
      studentId: input.createRequest.studentId ?? null,
      instructorId: input.createRequest.instructorId,
      previousInstructorId: null,
      preferredStartsAt: input.createRequest.preferredStartsAt ?? null,
      durationMinutes: input.createRequest.durationMinutes ?? settings.defaultDurationMinutes,
      status: "scheduling_required",
      liveClassId: null,
      zoomMeetingId: null,
      conflictSummary: null,
      queuePosition: null,
      attempts: 0,
      maxAttempts: settings.maxQueueAttempts,
      autoZoom: input.createRequest.autoZoom ?? settings.autoZoom,
      notes: null,
      createdById: input.createRequest.actorId,
      createdAt: stamp,
      updatedAt: stamp,
      scheduledAt: null,
      unableReason: null,
    };
    writeAssignmentDb((db) => {
      db.requests.unshift(request!);
    });
  }

  if (!request) throw new AssignmentError("Assignment request not found", 404);

  const preferred =
    input.startsAt ??
    request.preferredStartsAt ??
    findNextOpenSlot({
      instructorId: request.instructorId,
      durationMinutes: request.durationMinutes,
    });

  if (!preferred) {
    markUnable(request.id, "No open slot within look-ahead window");
    return {
      request: getRequest(request.id)!,
      queueItem: null,
      liveClassId: null,
      zoomMeetingId: null,
      conflicts: [],
      outcome: "unable_to_schedule",
    };
  }

  const endsAt = new Date(Date.parse(preferred) + request.durationMinutes * 60_000).toISOString();
  const report = detectInstructorConflicts({
    instructorId: request.instructorId,
    startsAt: preferred,
    endsAt,
  });

  writeAssignmentDb((db) => {
    const req = db.requests.find((r) => r.id === request!.id);
    if (!req) return;
    req.attempts += 1;
    req.updatedAt = nowIso();
    req.preferredStartsAt = preferred;
    req.conflictSummary = summarizeConflicts(report.conflicts) || null;
  });
  request = getRequest(request.id)!;

  if (report.hasConflict) {
    if (request.attempts >= request.maxAttempts) {
      markUnable(request.id, summarizeConflicts(report.conflicts) || "Conflicts unresolved");
      return {
        request: getRequest(request.id)!,
        queueItem: null,
        liveClassId: null,
        zoomMeetingId: null,
        conflicts: report.conflicts,
        outcome: "unable_to_schedule",
      };
    }
    const queueItem = enqueueWaiting({
      request,
      preferredStartsAt: preferred,
    });
    return {
      request: getRequest(request.id)!,
      queueItem,
      liveClassId: null,
      zoomMeetingId: null,
      conflicts: report.conflicts,
      outcome: "queued",
    };
  }

  // createLiveClass provisions Zoom meeting automatically (mock or live).
  const created = await createLiveClass({
    title: request.lessonTitle,
    description: `ATPL assignment engine session (${request.id})`,
    courseId: request.courseId,
    lessonId: request.lessonId,
    instructorId: request.instructorId,
    startsAt: preferred,
    endsAt,
    durationMinutes: request.durationMinutes,
    status: "scheduled",
    enrollStudentIds: request.studentId ? [request.studentId] : undefined,
    actorId: input.actorId,
  });

  if (!created) {
    markUnable(request.id, "Failed to create live class");
    return {
      request: getRequest(request.id)!,
      queueItem: null,
      liveClassId: null,
      zoomMeetingId: null,
      conflicts: [],
      outcome: "unable_to_schedule",
    };
  }

  const stamp = nowIso();
  writeAssignmentDb((db) => {
    const req = db.requests.find((r) => r.id === request!.id);
    if (req) {
      req.status = "scheduled";
      req.liveClassId = created.id;
      req.zoomMeetingId = created.zoomMeetingId;
      req.scheduledAt = preferred;
      req.queuePosition = null;
      req.updatedAt = stamp;
      req.unableReason = null;
      req.conflictSummary = null;
    }
    for (const q of db.queue) {
      if (q.assignmentRequestId === request!.id && q.status === "waiting") {
        q.status = "fulfilled";
        q.updatedAt = stamp;
      }
    }
  });
  bumpQueuePositions(request.instructorId);

  return {
    request: getRequest(request.id)!,
    queueItem: null,
    liveClassId: created.id,
    zoomMeetingId: created.zoomMeetingId,
    conflicts: [],
    outcome: "scheduled",
  };
}

function markUnable(requestId: string, reason: string) {
  const stamp = nowIso();
  writeAssignmentDb((db) => {
    const req = db.requests.find((r) => r.id === requestId);
    if (req) {
      req.status = "unable_to_schedule";
      req.unableReason = reason;
      req.updatedAt = stamp;
      req.queuePosition = null;
    }
    for (const q of db.queue) {
      if (
        q.assignmentRequestId === requestId &&
        (q.status === "waiting" || q.status === "processing")
      ) {
        q.status = "failed";
        q.failureReason = reason;
        q.updatedAt = stamp;
      }
    }
  });
}

/** Process waiting queue — try to schedule each waiting item. */
export async function processWaitingQueue(actorId: string | null = "system"): Promise<{
  processed: number;
  scheduled: number;
  unable: number;
  stillWaiting: number;
}> {
  const waiting = listWaitingQueue();
  let scheduled = 0;
  let unable = 0;
  let processed = 0;

  for (const item of waiting) {
    processed += 1;
    writeAssignmentDb((db) => {
      const q = db.queue.find((x) => x.id === item.id);
      if (q) {
        q.status = "processing";
        q.lastCheckedAt = nowIso();
        q.updatedAt = nowIso();
      }
    });

    const nextStart =
      item.preferredStartsAt && Date.parse(item.preferredStartsAt) > Date.now()
        ? item.preferredStartsAt
        : findNextOpenSlot({
            instructorId: item.instructorId,
            durationMinutes: item.durationMinutes,
          });

    const result = await scheduleAssignmentSession({
      requestId: item.assignmentRequestId,
      startsAt: nextStart ?? undefined,
      actorId: actorId ?? "system",
    });

    if (result.outcome === "scheduled") scheduled += 1;
    else if (result.outcome === "unable_to_schedule") unable += 1;
    else {
      writeAssignmentDb((db) => {
        const q = db.queue.find((x) => x.id === item.id);
        if (q && q.status === "processing") {
          q.status = "waiting";
          q.updatedAt = nowIso();
        }
      });
    }
  }

  return {
    processed,
    scheduled,
    unable,
    stillWaiting: listWaitingQueue().length,
  };
}

export function getInstructorCalendar(
  instructorId: string,
  range?: { from?: string; to?: string },
): {
  instructorId: string;
  instructorName: string;
  availability: ReturnType<typeof listAvailabilityWindows>;
  blocks: ReturnType<typeof listAvailabilityBlocks>;
  events: InstructorCalendarEvent[];
  queue: WaitingQueueItem[];
} {
  assertInstructor(instructorId);
  ensureClassesSeeded();
  ensureDefaultAvailability(instructorId);
  const user = findUserById(instructorId)!;
  const from = range?.from ? Date.parse(range.from) : Date.now() - 7 * 86_400_000;
  const to = range?.to ? Date.parse(range.to) : Date.now() + 21 * 86_400_000;

  const events: InstructorCalendarEvent[] = [];

  for (const c of listLiveClasses({ instructorId, pageSize: 200 }).data) {
    const start = Date.parse(c.startsAt);
    if (start < from || start > to) continue;
    events.push({
      id: `class-${c.id}`,
      title: c.title,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      type: "live_class",
      status: c.status,
      courseId: c.courseId,
      liveClassId: c.id,
      assignmentRequestId: null,
    });
  }

  for (const b of readBookingsDb().bookings) {
    if (b.instructorId !== instructorId) continue;
    if (b.status === "cancelled") continue;
    const start = Date.parse(b.startsAt);
    if (start < from || start > to) continue;
    events.push({
      id: `booking-${b.id}`,
      title: b.title || b.sessionTypeName,
      startsAt: b.startsAt,
      endsAt: b.endsAt,
      type: "booking",
      status: b.status,
      courseId: null,
      liveClassId: null,
      assignmentRequestId: null,
    });
  }

  for (const block of listAvailabilityBlocks(instructorId)) {
    const start = Date.parse(block.startsAt);
    if (start < from || start > to) continue;
    events.push({
      id: `block-${block.id}`,
      title: block.reason,
      startsAt: block.startsAt,
      endsAt: block.endsAt,
      type: "block",
      status: "blocked",
      courseId: null,
      liveClassId: null,
      assignmentRequestId: null,
    });
  }

  for (const req of listAssignmentRequests({ instructorId })) {
    if (req.status !== "queued" && req.status !== "scheduling_required") continue;
    const start = req.preferredStartsAt ? Date.parse(req.preferredStartsAt) : NaN;
    if (!Number.isNaN(start) && (start < from || start > to)) continue;
    events.push({
      id: `req-${req.id}`,
      title: `${req.lessonTitle} (${req.status})`,
      startsAt: req.preferredStartsAt ?? req.createdAt,
      endsAt: req.preferredStartsAt
        ? new Date(Date.parse(req.preferredStartsAt) + req.durationMinutes * 60_000).toISOString()
        : req.createdAt,
      type: "queue",
      status: req.status,
      courseId: req.courseId,
      liveClassId: req.liveClassId,
      assignmentRequestId: req.id,
    });
  }

  events.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return {
    instructorId,
    instructorName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email,
    availability: listAvailabilityWindows(instructorId),
    blocks: listAvailabilityBlocks(instructorId),
    events,
    queue: listWaitingQueue(instructorId),
  };
}

export function getAssignmentEngineSnapshot() {
  ensureCoursesSeeded();
  const instructors = readAuthDb().users.filter((u) => u.role === ROLES.INSTRUCTOR);
  const requests = listAssignmentRequests();
  return {
    settings: readAssignmentDb().settings,
    counts: {
      instructors: instructors.length,
      requests: requests.length,
      schedulingRequired: requests.filter((r) => r.status === "scheduling_required").length,
      queued: requests.filter((r) => r.status === "queued").length,
      scheduled: requests.filter((r) => r.status === "scheduled").length,
      unable: requests.filter((r) => r.status === "unable_to_schedule").length,
      waitingQueue: listWaitingQueue().length,
    },
    instructors: instructors.map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
      email: u.email,
      windows: listAvailabilityWindows(u.id).length,
      openRequests: requests.filter(
        (r) =>
          r.instructorId === u.id && (r.status === "scheduling_required" || r.status === "queued"),
      ).length,
    })),
    recentRequests: requests.slice(0, 20),
    queue: listWaitingQueue(),
    atplCourses: readCoursesDb()
      .courses.filter((c) => !c.deletedAt && /^ATPL-/i.test(c.code))
      .map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        primaryInstructorId: c.primaryInstructorId,
      })),
  };
}
