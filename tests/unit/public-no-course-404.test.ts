import { describe, expect, it } from "vitest";

import { publicCourseHref } from "@/lib/courses/public-course-path";
import {
  getCourseById,
  listPublishedCoursesGroupedByInstructor,
} from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { isCoursePubliclyListed } from "@/services/courses/publishing";

describe("public surface never soft-404s published courses", () => {
  it("resolves every published catalog course by code", () => {
    ensureCoursesSeeded();
    const groups = listPublishedCoursesGroupedByInstructor(200);
    const courses = groups.flatMap((g) => g.courses);
    expect(courses.length).toBeGreaterThan(0);

    for (const course of courses) {
      expect(course.code?.trim()).toBeTruthy();
      const byCode = getCourseById(course.code);
      expect(byCode?.id).toBe(course.id);
      expect(isCoursePubliclyListed(byCode!)).toBe(true);
      expect(publicCourseHref(course)).toBe(`/courses/${encodeURIComponent(course.code)}`);
    }
  });
});
