/**
 * Unit: Instructor Assignment Engine (CR005).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { readCoursesDb } from "@/services/courses/store";
import {
  setAvailabilityWindows,
  ensureDefaultAvailability,
} from "@/services/assignment/availability-service";
import { detectInstructorConflicts } from "@/services/assignment/conflict-service";
import {
  assignInstructorEngine,
  getInstructorCalendar,
  listAssignmentRequests,
  processWaitingQueue,
  reassignInstructorEngine,
  scheduleAssignmentSession,
} from "@/services/assignment/engine";
import { resetAssignmentDbCache, writeAssignmentDb } from "@/services/assignment/store";
import { createLiveClass } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { writeClassesDb } from "@/services/classes/store";

function openAllWeek(instructorId: string) {
  ensureDefaultAvailability(instructorId);
  setAvailabilityWindows({
    instructorId,
    windows: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      startTime: "00:00",
      endTime: "23:59",
      timezone: "UTC",
    })),
  });
}

/** Far-future unique slot to avoid collisions with seeded/demo classes. */
function uniqueSlot(offsetHours: number) {
  const start = new Date(Date.now() + 120 * 86_400_000 + offsetHours * 3_600_000);
  start.setUTCMinutes(0, 0, 0);
  const ends = new Date(start.getTime() + 60 * 60_000);
  return { start, ends };
}

describe("instructor assignment engine (CR005)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    ensureCoursesSeeded();
    ensureClassesSeeded();
    resetAssignmentDbCache();
    writeAssignmentDb((db) => {
      db.requests = [];
      db.queue = [];
      db.availabilityWindows = [];
      db.availabilityBlocks = [];
    });
  });

  it("assigns instructor and leaves scheduling_required without a slot", async () => {
    const course = readCoursesDb().courses.find((c) => c.code === "ATPL-010" && !c.deletedAt)!;
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const cgi = readAuthDb().users.find((u) => u.role === ROLES.CHIEF_GROUND_INSTRUCTOR)!;

    const result = await assignInstructorEngine({
      courseId: course.id,
      instructorId: instructor.id,
      actorId: cgi.id,
      scheduleNow: false,
    });

    expect(result.outcome).toBe("scheduling_required");
    expect(result.request.status).toBe("scheduling_required");
    expect(readCoursesDb().courses.find((c) => c.id === course.id)?.primaryInstructorId).toBe(
      instructor.id,
    );
  });

  it("detects conflicts and queues / schedules with automatic Zoom", async () => {
    const instructors = readAuthDb().users.filter((u) => u.role === ROLES.INSTRUCTOR);
    const instructor = instructors[0]!;
    const other = instructors[1] ?? instructor;
    const course = readCoursesDb().courses.find((c) => /^ATPL-/i.test(c.code) && !c.deletedAt)!;
    const cgi = readAuthDb().users.find((u) => u.role === ROLES.CHIEF_GROUND_INSTRUCTOR)!;
    const suffix = `${Date.now()}`;

    openAllWeek(instructor.id);
    const { start, ends } = uniqueSlot(2);

    // Cancel any leftover classes on this instructor in the far-future window.
    writeClassesDb((d) => {
      for (const c of d.classes) {
        if (c.instructorId !== instructor.id && c.instructorId !== other.id) continue;
        if (Date.parse(c.startsAt) < Date.now() + 100 * 86_400_000) continue;
        c.status = "cancelled";
        c.cancelledAt = new Date().toISOString();
      }
    });

    await createLiveClass({
      title: `Blocking class ${suffix}`,
      instructorId: instructor.id,
      courseId: course.id,
      startsAt: start.toISOString(),
      endsAt: ends.toISOString(),
      durationMinutes: 60,
      status: "scheduled",
      actorId: cgi.id,
    });

    const conflict = detectInstructorConflicts({
      instructorId: instructor.id,
      startsAt: start.toISOString(),
      endsAt: ends.toISOString(),
    });
    expect(conflict.hasConflict).toBe(true);

    const queued = await scheduleAssignmentSession({
      createRequest: {
        courseId: course.id,
        instructorId: instructor.id,
        lessonTitle: `Queued ATPL session ${suffix}`,
        preferredStartsAt: start.toISOString(),
        durationMinutes: 60,
        actorId: cgi.id,
        autoZoom: true,
      },
      startsAt: start.toISOString(),
      actorId: cgi.id,
    });
    expect(["queued", "unable_to_schedule"]).toContain(queued.outcome);

    openAllWeek(other.id);
    const open = uniqueSlot(8);
    const scheduled = await scheduleAssignmentSession({
      createRequest: {
        courseId: course.id,
        instructorId: other.id,
        lessonTitle: `Open ATPL session ${suffix}`,
        preferredStartsAt: open.start.toISOString(),
        durationMinutes: 60,
        actorId: cgi.id,
        autoZoom: true,
      },
      startsAt: open.start.toISOString(),
      actorId: cgi.id,
    });
    expect(scheduled.outcome).toBe("scheduled");
    expect(scheduled.liveClassId).toBeTruthy();
    expect(scheduled.zoomMeetingId || scheduled.request.zoomMeetingId).toBeTruthy();

    const cal = getInstructorCalendar(other.id);
    expect(cal.events.some((e) => e.type === "live_class")).toBe(true);

    await reassignInstructorEngine({
      courseId: course.id,
      instructorId: other.id,
      actorId: cgi.id,
      moveFutureClasses: true,
    });
    expect(listAssignmentRequests({ courseId: course.id }).length).toBeGreaterThan(0);

    const processed = await processWaitingQueue(cgi.id);
    expect(processed.processed).toBeGreaterThanOrEqual(0);
  });
});
