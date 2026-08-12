import { describe, expect, it } from "vitest";

import {
  publicCourseHref,
  publicCourseRef,
  stableCourseId,
} from "@/lib/courses/public-course-path";
import { getCourseById, getCourseDetail } from "@/services/courses/course-service";
import { ensureCoursesSeeded } from "@/services/courses/seed";

describe("public course path resolution", () => {
  it("builds stable ids and hrefs from course codes", () => {
    expect(stableCourseId("ATPL-010")).toBe("course-atpl-010");
    expect(publicCourseRef({ id: "uuid", code: "ATPL-010" })).toBe("ATPL-010");
    expect(publicCourseHref({ id: "uuid", code: "ATPL-010" })).toBe("/courses/ATPL-010");
  });

  it("resolves published courses by code and loads modules", () => {
    ensureCoursesSeeded();
    const byCode = getCourseById("ATPL-010");
    expect(byCode?.code).toBe("ATPL-010");
    expect(byCode?.title).toMatch(/Air Law/i);

    const detail = getCourseDetail("ATPL-010");
    expect(detail?.id).toBe(byCode?.id);
    expect(detail?.modules.length).toBeGreaterThan(0);
  });
});
