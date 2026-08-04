import { describe, expect, it } from "vitest";

import { sanitizeEmail, sanitizeString, truncate } from "@/utils/sanitize";
import { hasMinRole, hasRole } from "@/utils/rbac";
import { ROLES } from "@/constants/roles";

describe("sanitize", () => {
  it("strips dangerous markup patterns", () => {
    expect(sanitizeString(`<script>alert(1)</script>`)).not.toContain("<");
    expect(sanitizeString("javascript:alert(1)")).not.toMatch(/javascript:/i);
  });

  it("normalizes email", () => {
    expect(sanitizeEmail("  Pilot@EagerPilots.COM ")).toBe("pilot@eagerpilots.com");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
    expect(truncate("abc", 10)).toBe("abc");
  });
});

describe("rbac helpers", () => {
  it("compares role hierarchy", () => {
    expect(hasMinRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)).toBe(true);
    expect(hasMinRole(ROLES.STUDENT, ROLES.INSTRUCTOR)).toBe(false);
  });

  it("checks exact roles", () => {
    expect(hasRole(ROLES.ADMIN, [ROLES.ADMIN, ROLES.SUPER_ADMIN])).toBe(true);
    expect(hasRole(ROLES.STUDENT, [ROLES.ADMIN])).toBe(false);
  });
});
