/**
 * Unit: Dynamic Schedule Management (CR008).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { distributeLecture, listAtplCourses } from "@/services/cgi/journey-service";
import { resetCgiDbCache, writeCgiDb } from "@/services/cgi/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { ensureClassesSeeded } from "@/services/classes/seed";
import {
  buildSchedule,
  cancelSession,
  getScheduleTimeline,
  listScheduleSessions,
  queueAudienceReminders,
  rescheduleSession,
  sendImmediateAudienceReminder,
} from "@/services/schedule/dynamic-schedule-service";

function farSlot(daysAhead: number) {
  const start = new Date(Date.now() + daysAhead * 86_400_000);
  start.setUTCHours(10, 0, 0, 0);
  return start;
}

describe("dynamic schedule management (CR008)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    ensureCoursesSeeded();
    ensureClassesSeeded();
    resetCgiDbCache();
    writeCgiDb((db) => {
      db.lectureAssignments = [];
      db.audit = [];
      db.seeded = true;
    });
  });

  it("builds recurring schedule and exposes timeline entries", async () => {
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;
    const start = farSlot(160);
    const title = `Weekly ATPL ops ${Date.now()}`;

    const built = await buildSchedule({
      title,
      instructorId: instructor.id,
      studentIds: [student.id],
      startsAt: start.toISOString(),
      durationMinutes: 60,
      recurrence: { frequency: "weekly", interval: 1, count: 3 },
      actorId: instructor.id,
    });

    expect(built.session?.title).toBe(title);
    expect(built.occurrences).toBeGreaterThanOrEqual(2);
    expect(built.session?.isRecurring).toBe(true);

    const sessions = listScheduleSessions({
      userId: instructor.id,
      role: ROLES.INSTRUCTOR,
      from: start.toISOString(),
    });
    expect(sessions.some((s) => s.id === built.session?.id)).toBe(true);

    const timeline = getScheduleTimeline({
      userId: instructor.id,
      role: ROLES.INSTRUCTOR,
      limit: 80,
    });
    expect(timeline.some((e) => e.liveClassId === built.session?.id)).toBe(true);
  });

  it("reschedules, cancels, and splits student/instructor reminders", async () => {
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;
    const start = farSlot(170);
    const title = `Met briefing ${Date.now()}`;

    const built = await buildSchedule({
      title,
      instructorId: instructor.id,
      studentIds: [student.id],
      startsAt: start.toISOString(),
      durationMinutes: 45,
      actorId: instructor.id,
    });
    const id = built.session!.id;

    const moved = await rescheduleSession({
      liveClassId: id,
      startsAt: new Date(Date.parse(start.toISOString()) + 86_400_000).toISOString(),
      actorId: instructor.id,
      actorRole: ROLES.INSTRUCTOR,
    });
    expect(moved?.id).not.toBe(id);
    expect(moved?.status).toBe("scheduled");

    const queuedStudents = await queueAudienceReminders(moved!.id, "student");
    expect(queuedStudents.audience).toBe("student");
    expect(queuedStudents.queued).toBeGreaterThan(0);

    const instructorPing = await sendImmediateAudienceReminder({
      liveClassId: moved!.id,
      audience: "instructor",
      actorId: instructor.id,
    });
    expect(instructorPing.notified).toBeGreaterThan(0);

    const cancelled = await cancelSession({
      liveClassId: moved!.id,
      reason: "Weather",
      actorId: instructor.id,
      actorRole: ROLES.INSTRUCTOR,
    });
    expect(cancelled.cancelledCount).toBe(1);
    expect(cancelled.sessions[0]?.status).toBe("cancelled");
  });

  it("links ATPL distributeLecture to a live class when scheduled", async () => {
    const subjects = listAtplCourses();
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const cgi = readAuthDb().users.find((u) => u.role === ROLES.CHIEF_GROUND_INSTRUCTOR)!;
    const start = farSlot(180);

    const lecture = await distributeLecture({
      courseId: subjects[0]!.id,
      lessonId: `lesson-cr008-${Date.now()}`,
      lessonTitle: "ATPL scheduled lecture",
      instructorId: instructor.id,
      scheduledAt: start.toISOString(),
      actorId: cgi.id,
    });

    expect(lecture.status).toBe("scheduled");
    expect(lecture.liveClassId).toBeTruthy();

    const sessions = listScheduleSessions({
      userId: cgi.id,
      role: ROLES.CHIEF_GROUND_INSTRUCTOR,
      source: "atpl",
      from: start.toISOString(),
    });
    expect(sessions.some((s) => s.id === lecture.liveClassId)).toBe(true);
    expect(sessions.find((s) => s.id === lecture.liveClassId)?.source).toBe("atpl");
  });
});
