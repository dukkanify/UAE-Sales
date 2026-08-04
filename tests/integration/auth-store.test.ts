/**
 * Integration: authentication store ↔ session/permission boundaries.
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import { findUserByEmail, readAuthDb, toUserProfile } from "@/services/auth/store";
import { hasPermission } from "@/services/auth/permissions";
import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requestOtp } from "@/services/auth/auth-service";

describe("auth ↔ database integration", () => {
  beforeAll(() => {
    ensureSuperAdminSeeded();
  });

  it("seeds demo users into auth store", () => {
    const student = findUserByEmail("student.one@eagerpilots.com");
    expect(student).toBeTruthy();
    expect(toUserProfile(student!).role).toBe(ROLES.STUDENT);
  });

  it("issues OTP challenge into auth store (cookie session issued at HTTP layer)", async () => {
    const email = "student.one@eagerpilots.com";
    const req = await requestOtp({ email, purpose: "login", rememberMe: true });
    expect(req.success).toBe(true);
    const challenge = readAuthDb().otps.find((o) => o.email === email && o.purpose === "login");
    expect(challenge).toBeTruthy();
    expect(challenge!.expiresAt).toBeTruthy();
  });

  it("enforces permission boundary for student vs admin", () => {
    expect(hasPermission(ROLES.STUDENT, PERMISSIONS.SYSTEM_SETTINGS)).toBe(false);
    expect(hasPermission(ROLES.ADMIN, PERMISSIONS.COURSES_MANAGE)).toBe(true);
  });
});
