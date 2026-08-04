import { describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { resolveDashboardScope } from "@/lib/security/dashboard-scope";

describe("resolveDashboardScope", () => {
  it("defaults to the caller role", () => {
    expect(resolveDashboardScope(ROLES.STUDENT, null)).toBe(ROLES.STUDENT);
  });

  it("blocks privilege escalation via scope query", () => {
    expect(resolveDashboardScope(ROLES.STUDENT, "super_admin")).toBe(ROLES.STUDENT);
    expect(resolveDashboardScope(ROLES.INSTRUCTOR, "admin")).toBe(ROLES.INSTRUCTOR);
  });

  it("allows equal or lower scopes", () => {
    expect(resolveDashboardScope(ROLES.SUPER_ADMIN, "admin")).toBe(ROLES.ADMIN);
    expect(resolveDashboardScope(ROLES.ADMIN, "admin")).toBe(ROLES.ADMIN);
  });

  it("ignores unknown scopes", () => {
    expect(resolveDashboardScope(ROLES.ADMIN, "nope")).toBe(ROLES.ADMIN);
  });
});
