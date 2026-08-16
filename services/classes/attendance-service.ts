/**
 * Attendance foundation — statuses, join/leave, duration.
 * Detailed analytics deferred.
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ATTENDANCE_STATUSES } from "@/constants/classes";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb } from "@/services/auth/store";
import { getLiveClass } from "@/services/classes/class-service";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import { ClassValidationError } from "@/services/classes/validation";
import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceWithStudent,
} from "@/types/classes";

function studentMeta(studentId: string) {
  const u = readAuthDb().users.find((x) => x.id === studentId);
  if (!u) return { studentName: null, studentEmail: null };
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return { studentName: name || u.email, studentEmail: u.email };
}

export function listAttendance(liveClassId: string): AttendanceWithStudent[] {
  return readClassesDb()
    .attendance.filter((a) => a.liveClassId === liveClassId)
    .map((a) => ({ ...a, ...studentMeta(a.studentId) }));
}

export async function upsertAttendance(input: {
  liveClassId: string;
  studentId: string;
  status: AttendanceStatus;
  joinTime?: string | null;
  leaveTime?: string | null;
  notes?: string | null;
  actorId: string | null;
}): Promise<AttendanceWithStudent> {
  if (!getLiveClass(input.liveClassId)) {
    throw new ClassValidationError("Live class not found");
  }
  if (!ATTENDANCE_STATUSES.includes(input.status)) {
    throw new ClassValidationError("Invalid attendance status");
  }

  const cls = getLiveClass(input.liveClassId)!;
  const classDuration = Math.max(1, cls.durationMinutes * 60);
  let durationSeconds = 0;
  if (input.joinTime && input.leaveTime) {
    durationSeconds = Math.max(
      0,
      Math.floor((Date.parse(input.leaveTime) - Date.parse(input.joinTime)) / 1000),
    );
  }
  const attendancePercent = Math.min(
    100,
    Math.round((durationSeconds / classDuration) * 100),
  );

  const existing = readClassesDb().attendance.find(
    (a) => a.liveClassId === input.liveClassId && a.studentId === input.studentId,
  );
  const now = new Date().toISOString();

  let record: AttendanceRecord;
  if (existing) {
    record = {
      ...existing,
      status: input.status,
      joinTime: input.joinTime !== undefined ? input.joinTime : existing.joinTime,
      leaveTime: input.leaveTime !== undefined ? input.leaveTime : existing.leaveTime,
      durationSeconds:
        input.joinTime || input.leaveTime ? durationSeconds : existing.durationSeconds,
      attendancePercent:
        input.joinTime || input.leaveTime ? attendancePercent : existing.attendancePercent,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      updatedAt: now,
    };
    writeClassesDb((d) => {
      const idx = d.attendance.findIndex((a) => a.id === existing.id);
      if (idx >= 0) d.attendance[idx] = record;
    });
  } else {
    record = {
      id: generateId(),
      liveClassId: input.liveClassId,
      studentId: input.studentId,
      status: input.status,
      joinTime: input.joinTime ?? null,
      leaveTime: input.leaveTime ?? null,
      durationSeconds,
      attendancePercent,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };
    writeClassesDb((d) => {
      d.attendance.push(record);
    });
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.ATTENDANCE_UPDATED,
    entityType: "attendance",
    entityId: record.id,
    metadata: { liveClassId: input.liveClassId, studentId: input.studentId, status: input.status },
  });

  return { ...record, ...studentMeta(input.studentId) };
}

export async function markJoin(input: {
  liveClassId: string;
  studentId: string;
  actorId: string | null;
}) {
  return upsertAttendance({
    liveClassId: input.liveClassId,
    studentId: input.studentId,
    status: "present",
    joinTime: new Date().toISOString(),
    actorId: input.actorId,
  });
}

export async function markLeave(input: {
  liveClassId: string;
  studentId: string;
  actorId: string | null;
}) {
  const existing = readClassesDb().attendance.find(
    (a) => a.liveClassId === input.liveClassId && a.studentId === input.studentId,
  );
  return upsertAttendance({
    liveClassId: input.liveClassId,
    studentId: input.studentId,
    status: existing?.status ?? "present",
    joinTime: existing?.joinTime ?? new Date().toISOString(),
    leaveTime: new Date().toISOString(),
    actorId: input.actorId,
  });
}

export function getAttendanceOverview(
  instructorIdOrOpts?: string | { instructorId?: string; studentId?: string },
) {
  const opts =
    typeof instructorIdOrOpts === "string"
      ? { instructorId: instructorIdOrOpts }
      : (instructorIdOrOpts ?? {});
  let classes = readClassesDb().classes.filter((c) => !c.deletedAt);
  if (opts.instructorId) {
    classes = classes.filter(
      (c) =>
        c.instructorId === opts.instructorId || c.assistantInstructorId === opts.instructorId,
    );
  }
  if (opts.studentId) {
    const classIds = new Set(
      readClassesDb()
        .participants.filter((p) => p.userId === opts.studentId)
        .map((p) => p.liveClassId),
    );
    classes = classes.filter((c) => classIds.has(c.id));
  }
  const ids = new Set(classes.map((c) => c.id));
  let rows = readClassesDb().attendance.filter((a) => ids.has(a.liveClassId));
  if (opts.studentId) {
    rows = rows.filter((a) => a.studentId === opts.studentId);
  }
  const total = rows.length;
  const present = rows.filter((a) => ["present", "late"].includes(a.status)).length;
  return {
    records: total,
    present,
    late: rows.filter((a) => a.status === "late").length,
    absent: rows.filter((a) => a.status === "absent").length,
    rate: total === 0 ? 0 : Math.round((present / total) * 100),
  };
}
