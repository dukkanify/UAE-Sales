/**
 * Unit: course publishing & public visibility rules (CR001).
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureCoursesSeeded } from "@/services/courses/seed";
import {
  applyDueScheduledPublishes,
  getCourseById,
  listPublishedCoursesGroupedByInstructor,
  updateCourse,
  updateCoursePublishing,
} from "@/services/courses/course-service";
import { canAcceptEnrollment, isCoursePubliclyListed } from "@/services/courses/publishing";
import { enrollStudent } from "@/services/courses/enrollment-service";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { writeCoursesDb } from "@/services/courses/store";
import { updatePlatformSettings } from "@/services/settings/settings-service";

describe("course publishing & visibility (CR001)", () => {
  beforeAll(() => {
    ensureCoursesSeeded();
  });

  it("lists only publicly listed published courses for marketing groups", () => {
    const groups = listPublishedCoursesGroupedByInstructor();
    for (const group of groups) {
      for (const course of group.courses) {
        expect(isCoursePubliclyListed(course)).toBe(true);
        expect(course.hidden).toBe(false);
        expect(course.status).toBe("published");
      }
    }
  });

  it("hides a course from public listing when hidden=true", async () => {
    const course = listPublishedCoursesGroupedByInstructor().flatMap((g) => g.courses)[0];
    expect(course).toBeTruthy();

    await updateCoursePublishing({
      id: course!.id,
      patch: { hidden: true },
      actorId: null,
    });

    expect(
      isCoursePubliclyListed({
        ...course!,
        hidden: true,
      }),
    ).toBe(false);

    const codes = listPublishedCoursesGroupedByInstructor().flatMap((g) =>
      g.courses.map((c) => c.id),
    );
    expect(codes).not.toContain(course!.id);

    await updateCoursePublishing({
      id: course!.id,
      patch: { hidden: false },
      actorId: null,
    });
  });

  it("blocks enrollment when enrollment is closed", async () => {
    const course = listPublishedCoursesGroupedByInstructor().flatMap((g) => g.courses)[0]!;
    await updateCoursePublishing({
      id: course.id,
      patch: { enrollmentOpen: false, status: "published", hidden: false },
      actorId: null,
    });

    const gate = canAcceptEnrollment(getCourseById(course.id)!);
    expect(gate.ok).toBe(false);

    // Use a student who is not already enrolled so the gate message is unambiguous.
    const enrolledIds = new Set(
      (await import("@/services/courses/store"))
        .readCoursesDb()
        .enrollments.filter((e) => e.courseId === course.id)
        .map((e) => e.studentId),
    );
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && !enrolledIds.has(u.id),
    );
    expect(student).toBeTruthy();

    await expect(
      enrollStudent({
        courseId: course.id,
        studentId: student!.id,
        actorId: null,
      }),
    ).rejects.toThrow(/Enrollment is closed/i);

    await updateCoursePublishing({
      id: course.id,
      patch: { enrollmentOpen: true },
      actorId: null,
    });
  });

  it("promotes scheduled courses when publish time is due", async () => {
    const created = await (
      await import("@/services/courses/course-service")
    ).createCourse({
      title: "CR001 Schedule Fixture",
      code: `CR001-SCHED-${Date.now()}`,
      primaryInstructorId: readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)?.id ?? null,
      actorId: null,
      status: "draft",
    });

    const past = new Date(Date.now() - 60_000).toISOString();
    writeCoursesDb((d) => {
      const idx = d.courses.findIndex((c) => c.id === created.id);
      if (idx >= 0) {
        d.courses[idx] = {
          ...d.courses[idx]!,
          status: "scheduled",
          scheduledPublishAt: past,
          publishedAt: null,
        };
      }
    });

    // Read directly from store to avoid catalog enrichment re-publishing fixtures.
    const before = (await import("@/services/courses/store"))
      .readCoursesDb()
      .courses.find((c) => c.id === created.id);
    expect(before?.status).toBe("scheduled");

    const changed = applyDueScheduledPublishes();
    expect(changed).toBeGreaterThanOrEqual(1);
    expect(getCourseById(created.id)?.status).toBe("published");
  });

  it("respects public delivery filter recorded|live", async () => {
    const course = listPublishedCoursesGroupedByInstructor().flatMap((g) => g.courses)[0]!;

    await updateCoursePublishing({
      id: course.id,
      patch: { deliveryType: "live", status: "published", hidden: false },
      actorId: null,
    });

    await updatePlatformSettings({
      patch: { courses: { publicDeliveryFilter: "recorded" } },
      actorId: null,
    });

    expect(isCoursePubliclyListed(getCourseById(course.id)!, { deliveryFilter: "recorded" })).toBe(
      false,
    );
    expect(isCoursePubliclyListed(getCourseById(course.id)!, { deliveryFilter: "live" })).toBe(
      true,
    );

    await updateCoursePublishing({
      id: course.id,
      patch: { deliveryType: "recorded" },
      actorId: null,
    });
    await updatePlatformSettings({
      patch: { courses: { publicDeliveryFilter: "all" } },
      actorId: null,
    });
  });

  it("does not change publishing fields via generic update when omitted", async () => {
    const course = getCourseById(
      listPublishedCoursesGroupedByInstructor().flatMap((g) => g.courses)[0]!.id,
    )!;
    const before = {
      status: course.status,
      deliveryType: course.deliveryType,
      enrollmentOpen: course.enrollmentOpen,
      hidden: course.hidden,
    };

    await updateCourse({
      id: course.id,
      patch: { shortDescription: `${course.shortDescription} ` },
      actorId: null,
    });

    const after = getCourseById(course.id)!;
    expect(after.status).toBe(before.status);
    expect(after.deliveryType).toBe(before.deliveryType);
    expect(after.enrollmentOpen).toBe(before.enrollmentOpen);
    expect(after.hidden).toBe(before.hidden);
  });
});
