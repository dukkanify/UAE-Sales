import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import {
  assertPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  PermissionError,
} from "@/services/auth/permissions";
import type { UserProfile } from "@/types";

function user(role: UserProfile["role"]): UserProfile {
  return {
    id: "u1",
    email: "u@example.com",
    firstName: "A",
    lastName: "B",
    fullName: "A B",
    phone: null,
    countryCode: null,
    nationality: null,
    dateOfBirth: null,
    gender: null,
    city: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    avatarUrl: null,
    timezone: "UTC",
    language: "en",
    role,
    status: "active",
    emailVerified: true,
    profileComplete: true,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("permissions", () => {
  it("grants super admin all permissions", () => {
    expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.SYSTEM_SETTINGS)).toBe(true);
    expect(hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.COURSES_MANAGE)).toBe(true);
  });

  it("restricts student from system settings", () => {
    expect(hasPermission(ROLES.STUDENT, PERMISSIONS.SYSTEM_SETTINGS)).toBe(false);
    expect(hasPermission(ROLES.STUDENT, PERMISSIONS.COURSES_ENROLLED)).toBe(true);
  });

  it("supports any/all helpers", () => {
    expect(
      hasAnyPermission(ROLES.INSTRUCTOR, [PERMISSIONS.SYSTEM_SETTINGS, PERMISSIONS.COURSES_OWN]),
    ).toBe(true);
    expect(
      hasAllPermissions(ROLES.STUDENT, [PERMISSIONS.COURSES_ENROLLED, PERMISSIONS.SYSTEM_SETTINGS]),
    ).toBe(false);
  });

  it("assertPermission throws PermissionError", () => {
    expect(() => assertPermission(null, PERMISSIONS.COURSES_MANAGE)).toThrow(PermissionError);
    expect(() => assertPermission(user(ROLES.STUDENT), PERMISSIONS.SYSTEM_SETTINGS)).toThrow(
      PermissionError,
    );
    expect(() =>
      assertPermission(user(ROLES.SUPER_ADMIN), PERMISSIONS.SYSTEM_SETTINGS),
    ).not.toThrow();
  });
});
