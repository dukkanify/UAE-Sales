import { describe, expect, it, vi } from "vitest";

import { isValidHref, safeHref, safePath } from "@/lib/links/safe-href";

describe("safeHref", () => {
  it("keeps valid string and object hrefs", () => {
    expect(safeHref("/courses")).toBe("/courses");
    expect(safeHref({ pathname: "/", hash: "live" })).toEqual({
      pathname: "/",
      hash: "live",
    });
  });

  it("replaces undefined/null/empty with home fallback", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(safeHref(undefined)).toBe("/");
    expect(safeHref(null)).toBe("/");
    expect(safeHref("")).toBe("/");
    expect(safeHref("   ")).toBe("/");
    expect(safeHref(undefined, "/book")).toBe("/book");
    warn.mockRestore();
  });

  it("validates hrefs", () => {
    expect(isValidHref("/ok")).toBe(true);
    expect(isValidHref(undefined)).toBe(false);
    expect(isValidHref({ pathname: "/courses" })).toBe(true);
    expect(isValidHref({})).toBe(false);
  });
});

describe("safePath", () => {
  it("joins segments and falls back when any segment is missing", () => {
    expect(safePath(["student", "courses", "abc"])).toBe("/student/courses/abc");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(safePath(["student", "courses", undefined])).toBe("/");
    expect(safePath(["courses", null], "/courses")).toBe("/courses");
    warn.mockRestore();
  });
});
