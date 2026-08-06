/**
 * Integration: published courses grouped by instructor + ownership helpers.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import {
  createCourse,
  instructorOwnsCourse,
  listCourses,
  listPublishedCoursesGroupedByInstructor,
} from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";

describe("courses by instructor", () => {
  beforeAll(() => {
    ensureDemoUsersSeeded();
    ensureCoursesSeeded();
  });

  it("groups published courses under instructor names", () => {
    const groups = listPublishedCoursesGroupedByInstructor();
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.instructorName.length).toBeGreaterThan(0);
      expect(group.courses.length).toBeGreaterThan(0);
      expect(group.courses.every((c) => c.status === "published")).toBe(true);
      expect(group.courses.every((c) => !c.code.startsWith("INS-TEST-"))).toBe(true);
      if (group.instructorId) {
        expect(
          group.courses.every(
            (c) =>
              c.primaryInstructorId === group.instructorId ||
              c.primaryInstructorName === group.instructorName,
          ),
        ).toBe(true);
      }
    }
  });

  it("lets an instructor create a course owned by themselves", async () => {
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR);
    expect(instructor).toBeTruthy();

    const code = `INS-TEST-${Date.now().toString(36).toUpperCase()}`;
    const course = await createCourse({
      title: "Instructor owned meteorology",
      code,
      shortDescription: "Owned by the creating instructor",
      status: "published",
      primaryInstructorId: instructor!.id,
      actorId: instructor!.id,
    });

    expect(course.primaryInstructorId).toBe(instructor!.id);
    expect(instructorOwnsCourse(instructor!.id, course.id)).toBe(true);

    const other = readAuthDb().users.find(
      (u) => u.role === ROLES.INSTRUCTOR && u.id !== instructor!.id,
    );
    if (other) {
      expect(instructorOwnsCourse(other.id, course.id)).toBe(false);
    }

    const listed = listCourses({ instructorId: instructor!.id, pageSize: 100 });
    expect(listed.data.some((c) => c.id === course.id)).toBe(true);
  });

  it("does not treat students as course owners", () => {
    const published = listCourses({ status: "published", pageSize: 1 }).data[0];
    expect(published).toBeTruthy();
    const student = readAuthDb().users.find((u) => u.role === ROLES.STUDENT);
    expect(student).toBeTruthy();
    expect(instructorOwnsCourse(student!.id, published!.id)).toBe(false);
  });
});
