/**
 * Live class service — CRUD, cancel, reschedule, duplicate, join status.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import {
  DEFAULT_CLASS_DURATION_MINUTES,
  DEFAULT_CLASS_PAGE_SIZE,
  DEFAULT_MAX_STUDENTS,
} from "@/constants/classes";
import { ROLES } from "@/constants/roles";
import { logActivity, logAudit } from "@/services/auth/activity-log";
import { readAuthDb } from "@/services/auth/store";
import { createNotification } from "@/services/notifications/notification-service";
import { listEnrollments } from "@/services/courses/enrollment-service";
import { getCourseById } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import {
  createMeetingForClass,
  updateMeetingForClass,
  cancelMeetingForClass,
  getZoomMeetingByClassId,
  getPublicJoinInfo,
} from "@/services/classes/zoom-service";
import {
  computeEnd,
  createRecurringRule,
  expandOccurrences,
} from "@/services/classes/schedule-service";
import { queueClassReminders, cancelClassReminders } from "@/services/classes/reminder-service";
import {
  ClassValidationError,
  assertInstructorId,
  assertMeetingType,
  assertTimeRange,
  assertTitle,
  detectScheduleConflicts,
} from "@/services/classes/validation";
import type {
  ClassFilters,
  ClassStats,
  CreateLiveClassInput,
  LiveClass,
  LiveClassListItem,
  LiveClassStatus,
  MeetingParticipant,
} from "@/types/classes";
import { getPlatformSettings } from "@/services/settings/settings-service";

function userName(userId: string | null): string | null {
  if (!userId) return null;
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) return null;
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
}

export function computeRuntimeStatus(cls: LiveClass): LiveClassStatus | "upcoming" | "live_now" {
  if (["cancelled", "rescheduled", "draft", "completed"].includes(cls.status)) {
    return cls.status;
  }
  const now = Date.now();
  const start = Date.parse(cls.startsAt);
  const end = Date.parse(cls.endsAt);
  if (now >= start && now <= end) return "live_now";
  if (now > end) return "completed";
  if (cls.status === "scheduled" || cls.status === "live") return "upcoming";
  return cls.status;
}

function toListItem(cls: LiveClass): LiveClassListItem {
  ensureCoursesSeeded();
  const course = cls.courseId ? getCourseById(cls.courseId) : null;
  const zoom = getZoomMeetingByClassId(cls.id);
  const enrolled = readClassesDb().participants.filter(
    (p) => p.liveClassId === cls.id && p.role === "participant",
  ).length;
  return {
    ...cls,
    courseTitle: course?.title ?? null,
    courseCode: course?.code ?? null,
    instructorName: userName(cls.instructorId),
    assistantName: userName(cls.assistantInstructorId),
    enrolledCount: enrolled,
    computedStatus: computeRuntimeStatus(cls),
    zoomJoinUrl: zoom?.joinUrl ?? null,
  };
}

export function getLiveClass(id: string): LiveClass | null {
  ensureClassesSeeded();
  const cls = readClassesDb().classes.find((c) => c.id === id);
  if (!cls || cls.deletedAt) return null;
  return cls;
}

export function getLiveClassDetail(id: string) {
  const cls = getLiveClass(id);
  if (!cls) return null;
  const zoom = getZoomMeetingByClassId(id);
  return {
    ...toListItem(cls),
    zoom: zoom
      ? {
          id: zoom.id,
          zoomMeetingId: zoom.zoomMeetingId,
          joinUrl: zoom.joinUrl,
          password: zoom.password,
          waitingRoom: zoom.waitingRoom,
          providerMode: zoom.providerMode,
          coHostEmails: zoom.coHostEmails,
        }
      : null,
    participants: readClassesDb().participants.filter((p) => p.liveClassId === id),
    recordings: readClassesDb().recordings.filter((r) => r.liveClassId === id),
  };
}

export function listLiveClasses(filters: ClassFilters = {}): {
  data: LiveClassListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  ensureClassesSeeded();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_CLASS_PAGE_SIZE;
  let rows = readClassesDb().classes.filter((c) => !c.deletedAt);

  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }
  if (filters.courseId) rows = rows.filter((c) => c.courseId === filters.courseId);
  if (filters.instructorId) {
    rows = rows.filter(
      (c) =>
        c.instructorId === filters.instructorId ||
        c.assistantInstructorId === filters.instructorId,
    );
  }
  if (filters.from) {
    const from = Date.parse(filters.from);
    rows = rows.filter((c) => Date.parse(c.endsAt) >= from);
  }
  if (filters.to) {
    const to = Date.parse(filters.to);
    rows = rows.filter((c) => Date.parse(c.startsAt) <= to);
  }
  if (filters.status && filters.status !== "all") {
    rows = rows.filter((c) => {
      const runtime = computeRuntimeStatus(c);
      if (filters.status === "upcoming") return runtime === "upcoming";
      if (filters.status === "live_now") return runtime === "live_now";
      return c.status === filters.status || runtime === filters.status;
    });
  }

  rows = [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize).map(toListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getClassStats(instructorId?: string): ClassStats {
  ensureClassesSeeded();
  let rows = readClassesDb().classes.filter((c) => !c.deletedAt);
  if (instructorId) {
    rows = rows.filter(
      (c) => c.instructorId === instructorId || c.assistantInstructorId === instructorId,
    );
  }
  const items = rows.map(toListItem);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const attendance = readClassesDb().attendance;
  const marked = attendance.filter((a) => a.status !== "unknown");
  const presentish = attendance.filter((a) =>
    ["present", "late"].includes(a.status),
  ).length;
  const attendanceRate =
    marked.length === 0 ? 0 : Math.round((presentish / marked.length) * 100);

  return {
    today: items.filter((c) => {
      const t = Date.parse(c.startsAt);
      return t >= todayStart.getTime() && t <= todayEnd.getTime() && c.status !== "cancelled";
    }).length,
    upcoming: items.filter((c) => c.computedStatus === "upcoming").length,
    liveNow: items.filter((c) => c.computedStatus === "live_now").length,
    completed: items.filter(
      (c) => c.status === "completed" || c.computedStatus === "completed",
    ).length,
    cancelled: items.filter((c) => c.status === "cancelled").length,
    attendanceRate,
    recentlyUpdated: [...items]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 5),
  };
}

function assertInstructorUser(userId: string) {
  const u = readAuthDb().users.find((x) => x.id === userId);
  if (!u) throw new ClassValidationError("Instructor not found");
  if (
    u.role !== ROLES.INSTRUCTOR &&
    u.role !== ROLES.ADMIN &&
    u.role !== ROLES.SUPER_ADMIN
  ) {
    throw new ClassValidationError("Assigned instructor must be an instructor or admin");
  }
}

function addParticipants(liveClassId: string, userIds: string[], role: MeetingParticipant["role"]) {
  const now = new Date().toISOString();
  writeClassesDb((d) => {
    for (const userId of userIds) {
      if (d.participants.some((p) => p.liveClassId === liveClassId && p.userId === userId)) {
        continue;
      }
      d.participants.push({
        id: generateId(),
        liveClassId,
        userId,
        role,
        invitedAt: now,
        joinedAt: null,
      });
    }
  });
}

async function notifyUsers(
  userIds: string[],
  title: string,
  body: string,
  type: string,
  data: Record<string, unknown>,
) {
  for (const userId of [...new Set(userIds)]) {
    await createNotification({ userId, title, body, type, data, channel: "in_app" });
  }
}

export async function createLiveClass(
  input: CreateLiveClassInput,
): Promise<ReturnType<typeof getLiveClassDetail>> {
  ensureClassesSeeded();
  const title = assertTitle(input.title);
  const instructorId = assertInstructorId(input.instructorId);
  assertInstructorUser(instructorId);
  if (input.assistantInstructorId) assertInstructorUser(input.assistantInstructorId);

  const settings = getPlatformSettings();
  const timezone =
    input.timezone?.trim() ||
    settings.localization.timezone ||
    settings.general.defaultTimezone ||
    "UTC";
  const durationMinutes = Math.max(
    15,
    Number(input.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES,
  );
  const startsAt = new Date(input.startsAt).toISOString();
  if (Number.isNaN(Date.parse(startsAt))) {
    throw new ClassValidationError("Invalid start time");
  }
  const endsAt = input.endsAt
    ? new Date(input.endsAt).toISOString()
    : computeEnd(startsAt, durationMinutes);
  assertTimeRange(startsAt, endsAt);
  const meetingType = assertMeetingType(
    input.meetingType ?? settings.zoom.defaultMeetingType ?? "meeting",
  );

  const conflicts = detectScheduleConflicts({
    instructorId,
    startsAt,
    endsAt,
    studentIds: input.enrollStudentIds,
  });
  if (conflicts.instructorConflict) {
    throw new ClassValidationError(
      `Instructor is already booked for "${conflicts.instructorConflict.title}"`,
    );
  }
  if (conflicts.studentConflicts.length) {
    throw new ClassValidationError("One or more students have overlapping sessions");
  }

  if (input.courseId && !getCourseById(input.courseId)) {
    throw new ClassValidationError("Course not found");
  }

  let recurringRuleId: string | null = null;
  if (input.recurrence && input.recurrence.frequency !== "once") {
    const rule = createRecurringRule({
      frequency: input.recurrence.frequency,
      interval: input.recurrence.interval,
      byWeekday: input.recurrence.byWeekday,
      count: input.recurrence.count,
      until: input.recurrence.until,
      timezone,
    });
    recurringRuleId = rule.id;
  }

  const now = new Date().toISOString();
  const status: LiveClassStatus = input.status ?? "scheduled";
  const base: LiveClass = {
    id: generateId(),
    title,
    description: input.description?.trim() ?? "",
    courseId: input.courseId ?? null,
    moduleId: input.moduleId ?? null,
    lessonId: input.lessonId ?? null,
    instructorId,
    assistantInstructorId: input.assistantInstructorId ?? null,
    startsAt,
    endsAt,
    durationMinutes,
    timezone,
    maxStudents: Math.max(1, Number(input.maxStudents) || DEFAULT_MAX_STUDENTS),
    meetingType,
    status,
    zoomMeetingId: null,
    recurringRuleId,
    parentClassId: null,
    cancelledAt: null,
    cancelReason: null,
    rescheduledFromId: null,
    createdById: input.actorId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const occurrences: LiveClass[] = [base];
  if (recurringRuleId) {
    const rule = readClassesDb().recurringRules.find((r) => r.id === recurringRuleId)!;
    for (const occStart of expandOccurrences(startsAt, rule)) {
      const occEnd = computeEnd(occStart, durationMinutes);
      const conflict = detectScheduleConflicts({
        instructorId,
        startsAt: occStart,
        endsAt: occEnd,
      });
      if (conflict.instructorConflict) continue;
      occurrences.push({
        ...base,
        id: generateId(),
        startsAt: occStart,
        endsAt: occEnd,
        parentClassId: base.id,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  writeClassesDb((d) => {
    d.classes.push(...occurrences);
  });

  for (const cls of occurrences) {
    await createMeetingForClass({
      liveClass: cls,
      waitingRoom: input.waitingRoom ?? settings.zoom.defaultWaitingRoom,
      passcode: settings.zoom.defaultPasscode,
      meetingType,
      actorId: input.actorId,
    });

    const participantIds = new Set<string>();
    participantIds.add(instructorId);
    if (input.assistantInstructorId) participantIds.add(input.assistantInstructorId);
    if (input.enrollStudentIds?.length) {
      input.enrollStudentIds.forEach((id) => participantIds.add(id));
    } else if (input.courseId) {
      listEnrollments(input.courseId)
        .filter((e) => e.status === "approved")
        .forEach((e) => participantIds.add(e.studentId));
    }
    addParticipants(
      cls.id,
      [instructorId],
      "host",
    );
    if (input.assistantInstructorId) {
      addParticipants(cls.id, [input.assistantInstructorId], "cohost");
    }
    const students = [...participantIds].filter(
      (id) => id !== instructorId && id !== input.assistantInstructorId,
    );
    addParticipants(cls.id, students, "participant");

    await queueClassReminders(cls.id);
    await notifyUsers(
      [...participantIds],
      "Live class scheduled",
      `${cls.title} · ${new Date(cls.startsAt).toLocaleString()}`,
      "class.created",
      { liveClassId: cls.id },
    );
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_CREATED,
    entityType: "live_class",
    entityId: base.id,
    metadata: { title, occurrences: occurrences.length },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
  await logAudit({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_CREATED,
    resource: `live_class:${base.id}`,
    afterState: base as unknown as Record<string, unknown>,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return getLiveClassDetail(base.id);
}

export async function updateLiveClass(input: {
  id: string;
  patch: Partial<CreateLiveClassInput>;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = getLiveClass(input.id);
  if (!existing) throw new ClassValidationError("Live class not found");

  const instructorId = input.patch.instructorId
    ? assertInstructorId(input.patch.instructorId)
    : existing.instructorId;
  if (input.patch.instructorId) assertInstructorUser(instructorId);

  const durationMinutes =
    input.patch.durationMinutes !== undefined
      ? Math.max(15, Number(input.patch.durationMinutes) || DEFAULT_CLASS_DURATION_MINUTES)
      : existing.durationMinutes;
  const startsAt = input.patch.startsAt
    ? new Date(input.patch.startsAt).toISOString()
    : existing.startsAt;
  const endsAt = input.patch.endsAt
    ? new Date(input.patch.endsAt).toISOString()
    : computeEnd(startsAt, durationMinutes);
  assertTimeRange(startsAt, endsAt);

  const conflicts = detectScheduleConflicts({
    instructorId,
    startsAt,
    endsAt,
    excludeClassId: existing.id,
  });
  if (conflicts.instructorConflict) {
    throw new ClassValidationError(
      `Instructor is already booked for "${conflicts.instructorConflict.title}"`,
    );
  }

  const now = new Date().toISOString();
  const next: LiveClass = {
    ...existing,
    title: input.patch.title !== undefined ? assertTitle(input.patch.title) : existing.title,
    description:
      input.patch.description !== undefined
        ? input.patch.description.trim()
        : existing.description,
    courseId:
      input.patch.courseId !== undefined ? input.patch.courseId : existing.courseId,
    moduleId:
      input.patch.moduleId !== undefined ? input.patch.moduleId : existing.moduleId,
    lessonId:
      input.patch.lessonId !== undefined ? input.patch.lessonId : existing.lessonId,
    instructorId,
    assistantInstructorId:
      input.patch.assistantInstructorId !== undefined
        ? input.patch.assistantInstructorId
        : existing.assistantInstructorId,
    startsAt,
    endsAt,
    durationMinutes,
    timezone: input.patch.timezone?.trim() || existing.timezone,
    maxStudents:
      input.patch.maxStudents !== undefined
        ? Math.max(1, Number(input.patch.maxStudents) || DEFAULT_MAX_STUDENTS)
        : existing.maxStudents,
    meetingType:
      input.patch.meetingType !== undefined
        ? assertMeetingType(input.patch.meetingType)
        : existing.meetingType,
    status: (input.patch.status as LiveClassStatus | undefined) ?? existing.status,
    updatedAt: now,
  };

  writeClassesDb((d) => {
    const idx = d.classes.findIndex((c) => c.id === existing.id);
    if (idx >= 0) d.classes[idx] = next;
  });

  await updateMeetingForClass({ liveClass: next, actorId: input.actorId });
  await cancelClassReminders(next.id);
  await queueClassReminders(next.id);

  const participantIds = readClassesDb()
    .participants.filter((p) => p.liveClassId === next.id)
    .map((p) => p.userId);
  await notifyUsers(
    participantIds,
    "Live class updated",
    `${next.title} schedule or details changed`,
    "class.updated",
    { liveClassId: next.id },
  );

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_UPDATED,
    entityType: "live_class",
    entityId: next.id,
    metadata: { title: next.title },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return getLiveClassDetail(next.id);
}

export async function cancelLiveClass(input: {
  id: string;
  reason?: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = getLiveClass(input.id);
  if (!existing) throw new ClassValidationError("Live class not found");
  const now = new Date().toISOString();
  writeClassesDb((d) => {
    const idx = d.classes.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      const current = d.classes[idx]!;
      d.classes[idx] = {
        ...current,
        status: "cancelled",
        cancelledAt: now,
        cancelReason: input.reason?.trim() || null,
        updatedAt: now,
      };
    }
  });
  await cancelMeetingForClass({ liveClassId: input.id, actorId: input.actorId });
  await cancelClassReminders(input.id);

  const participantIds = readClassesDb()
    .participants.filter((p) => p.liveClassId === input.id)
    .map((p) => p.userId);
  await notifyUsers(
    participantIds,
    "Live class cancelled",
    `${existing.title} has been cancelled`,
    "class.cancelled",
    { liveClassId: input.id },
  );

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_CANCELLED,
    entityType: "live_class",
    entityId: input.id,
    metadata: { reason: input.reason ?? null },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return getLiveClassDetail(input.id);
}

export async function rescheduleLiveClass(input: {
  id: string;
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = getLiveClass(input.id);
  if (!existing) throw new ClassValidationError("Live class not found");

  const startsAt = new Date(input.startsAt).toISOString();
  const durationMinutes = input.durationMinutes ?? existing.durationMinutes;
  const endsAt = input.endsAt
    ? new Date(input.endsAt).toISOString()
    : computeEnd(startsAt, durationMinutes);
  assertTimeRange(startsAt, endsAt);

  const conflicts = detectScheduleConflicts({
    instructorId: existing.instructorId,
    startsAt,
    endsAt,
    excludeClassId: existing.id,
  });
  if (conflicts.instructorConflict) {
    throw new ClassValidationError(
      `Instructor is already booked for "${conflicts.instructorConflict.title}"`,
    );
  }

  const now = new Date().toISOString();
  // Mark old as rescheduled, create new linked class
  writeClassesDb((d) => {
    const idx = d.classes.findIndex((c) => c.id === existing.id);
    if (idx >= 0) {
      const current = d.classes[idx]!;
      d.classes[idx] = {
        ...current,
        status: "rescheduled",
        updatedAt: now,
      };
    }
  });

  const created = await createLiveClass({
    title: existing.title,
    description: existing.description,
    courseId: existing.courseId,
    moduleId: existing.moduleId,
    lessonId: existing.lessonId,
    instructorId: existing.instructorId,
    assistantInstructorId: existing.assistantInstructorId,
    startsAt,
    endsAt,
    durationMinutes,
    timezone: existing.timezone,
    maxStudents: existing.maxStudents,
    meetingType: existing.meetingType,
    status: "scheduled",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  if (created) {
    writeClassesDb((d) => {
      const idx = d.classes.findIndex((c) => c.id === created.id);
      if (idx >= 0) {
        const current = d.classes[idx]!;
        d.classes[idx] = {
          ...current,
          rescheduledFromId: existing.id,
          updatedAt: now,
        };
      }
    });
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_RESCHEDULED,
    entityType: "live_class",
    entityId: created?.id ?? input.id,
    metadata: { from: existing.id, startsAt },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const participantIds = readClassesDb()
    .participants.filter((p) => p.liveClassId === existing.id || p.liveClassId === created?.id)
    .map((p) => p.userId);
  await notifyUsers(
    participantIds,
    "Live class rescheduled",
    `${existing.title} moved to ${new Date(startsAt).toLocaleString()}`,
    "class.rescheduled",
    { liveClassId: created?.id, fromId: existing.id },
  );

  return created;
}

export async function duplicateLiveClass(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = getLiveClass(input.id);
  if (!existing) throw new ClassValidationError("Live class not found");
  const startsAt = new Date(Date.parse(existing.startsAt) + 7 * 24 * 60 * 60 * 1000).toISOString();
  const endsAt = computeEnd(startsAt, existing.durationMinutes);

  const created = await createLiveClass({
    title: `${existing.title} (Copy)`,
    description: existing.description,
    courseId: existing.courseId,
    moduleId: existing.moduleId,
    lessonId: existing.lessonId,
    instructorId: existing.instructorId,
    assistantInstructorId: existing.assistantInstructorId,
    startsAt,
    endsAt,
    durationMinutes: existing.durationMinutes,
    timezone: existing.timezone,
    maxStudents: existing.maxStudents,
    meetingType: existing.meetingType,
    status: "draft",
    actorId: input.actorId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_DUPLICATED,
    entityType: "live_class",
    entityId: created?.id ?? null,
    metadata: { sourceId: input.id },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return created;
}

export async function softDeleteLiveClass(input: {
  id: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = getLiveClass(input.id);
  if (!existing) throw new ClassValidationError("Live class not found");
  const now = new Date().toISOString();
  writeClassesDb((d) => {
    const idx = d.classes.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      const current = d.classes[idx]!;
      d.classes[idx] = {
        ...current,
        deletedAt: now,
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      };
    }
  });
  await cancelMeetingForClass({ liveClassId: input.id, actorId: input.actorId });
  await cancelClassReminders(input.id);
  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.CLASS_DELETED,
    entityType: "live_class",
    entityId: input.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}

export function getJoinInfoForUser(liveClassId: string, userId: string) {
  const cls = getLiveClass(liveClassId);
  if (!cls) throw new ClassValidationError("Live class not found");
  const isHost =
    cls.instructorId === userId ||
    cls.assistantInstructorId === userId ||
    readAuthDb().users.find((u) => u.id === userId)?.role === ROLES.SUPER_ADMIN ||
    readAuthDb().users.find((u) => u.id === userId)?.role === ROLES.ADMIN;

  const participant = readClassesDb().participants.find(
    (p) => p.liveClassId === liveClassId && p.userId === userId,
  );
  if (!isHost && !participant) {
    throw new ClassValidationError("You are not invited to this class");
  }

  return {
    class: toListItem(cls),
    join: getPublicJoinInfo(liveClassId, Boolean(isHost)),
    isHost: Boolean(isHost),
  };
}

export function canManageClass(userId: string, role: string, liveClassId: string): boolean {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) return true;
  const cls = getLiveClass(liveClassId);
  if (!cls) return false;
  if (role === ROLES.INSTRUCTOR) {
    return cls.instructorId === userId || cls.assistantInstructorId === userId;
  }
  return false;
}
