/**
 * Permanent demo accounts + platform demo environment.
 */

import { beforeAll, describe, expect, it } from "vitest";

import {
  DEMO_ACCOUNT_PASSWORD,
  PRIMARY_DEMO_EMAILS,
  isPermanentDemoEmail,
} from "@/constants/demo-accounts";
import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { findUserByEmail, readAuthDb } from "@/services/auth/store";
import { ensurePlatformDemoEnvironment } from "@/services/demo/platform-demo-seed";
import { resetDemoEnvironment } from "@/services/demo/reset-demo-environment";
import { readCoursesDb } from "@/services/courses/store";
import { readBookingsDb } from "@/services/bookings/store";
import { readCgiDb } from "@/services/cgi/store";
import { verifyPassword } from "@/lib/security/crypto";

describe("permanent demo accounts", () => {
  beforeAll(() => {
    resetDemoEnvironment();
  });

  it("creates permanent role accounts as active and verified", () => {
    for (const email of Object.values(PRIMARY_DEMO_EMAILS)) {
      const user = findUserByEmail(email);
      expect(user, email).toBeTruthy();
      expect(user!.status).toBe("active");
      expect(user!.emailVerified).toBe(true);
      expect(user!.avatarUrl).toBeTruthy();
      expect(isPermanentDemoEmail(email)).toBe(true);
    }
  });

  it("assigns correct roles", () => {
    expect(findUserByEmail(PRIMARY_DEMO_EMAILS.superAdmin)?.role).toBe(ROLES.SUPER_ADMIN);
    expect(findUserByEmail(PRIMARY_DEMO_EMAILS.student)?.role).toBe(ROLES.STUDENT);
    expect(findUserByEmail(PRIMARY_DEMO_EMAILS.instructor)?.role).toBe(ROLES.INSTRUCTOR);
    expect(findUserByEmail(PRIMARY_DEMO_EMAILS.cgi)?.role).toBe(ROLES.CHIEF_GROUND_INSTRUCTOR);
  });

  it("stores temporary demo password hashes", () => {
    const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student)!;
    expect(student.passwordHash).toBeTruthy();
    expect(student.passwordSalt).toBeTruthy();
    expect(
      verifyPassword(DEMO_ACCOUNT_PASSWORD, student.passwordHash!, student.passwordSalt!),
    ).toBe(true);
  });

  it("completes primary student profile", () => {
    const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student)!;
    expect(student.profileComplete).toBe(true);
    expect(student.phone).toBeTruthy();
    expect(student.countryCode).toBeTruthy();
    expect(student.timezone).not.toBe("UTC");
  });

  it("enrols primary student in ATPL subjects", () => {
    const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student)!;
    const enrollments = readCoursesDb().enrollments.filter(
      (e) => e.studentId === student.id && e.status === "approved",
    );
    const atplCourseIds = new Set(
      readCoursesDb()
        .courses.filter((c) => c.code?.startsWith("ATPL-") && c.status === "published")
        .map((c) => c.id),
    );
    const atplEnrollments = enrollments.filter((e) => atplCourseIds.has(e.courseId));
    expect(atplEnrollments.length).toBeGreaterThanOrEqual(Math.min(3, atplCourseIds.size));
  });

  it("seeds demo notifications and bookings for the primary student", () => {
    const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student)!;
    const notes = readAuthDb().notifications.filter(
      (n) => n.userId === student.id && n.data?.demoSeed === true,
    );
    expect(notes.length).toBeGreaterThanOrEqual(3);
    const bookings = readBookingsDb().bookings.filter((b) => b.studentId === student.id);
    expect(bookings.length).toBeGreaterThanOrEqual(1);
  });

  it("seeds CGI subject plan for the primary student", () => {
    const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student)!;
    const plan = readCgiDb().subjectAssignments.filter((s) => s.studentId === student.id);
    expect(plan.length).toBeGreaterThanOrEqual(1);
  });

  it("is idempotent", () => {
    const before = readCoursesDb().enrollments.length;
    ensureDemoUsersSeeded();
    ensurePlatformDemoEnvironment();
    expect(readCoursesDb().enrollments.length).toBe(before);
  });
});
