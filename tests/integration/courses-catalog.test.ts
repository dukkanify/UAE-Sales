/**
 * Integration: courses catalog ↔ published status for learning surfaces.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureCoursesSeeded } from "@/services/courses/seed";
import {
  listCourses,
  listPublishedCoursesGroupedByInstructor,
} from "@/services/courses/course-service";

describe("courses ↔ lessons catalog", () => {
  beforeAll(() => {
    ensureCoursesSeeded();
  });

  it("lists courses with pagination metadata", () => {
    const result = listCourses({ page: 1, pageSize: 5 });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.total).toBeGreaterThanOrEqual(result.data.length);
  });

  it("filters published courses for public/mobile catalog", () => {
    const published = listCourses({ status: "published", pageSize: 50 });
    expect(published.data.every((c) => c.status === "published")).toBe(true);
  });

  it("exposes a rich published ATPL catalog for marketing", () => {
    const groups = listPublishedCoursesGroupedByInstructor();
    const titles = groups.flatMap((g) => g.courses.map((c) => c.title));
    expect(titles.length).toBeGreaterThanOrEqual(6);
    expect(titles.some((t) => /Air Law/i.test(t))).toBe(true);
    expect(titles.some((t) => /Meteorology/i.test(t))).toBe(true);
  });
});
