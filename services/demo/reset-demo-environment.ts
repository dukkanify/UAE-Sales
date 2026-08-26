/**
 * Reset permanent demo accounts and re-apply demo domain data.
 * Safe for local / staging — does not touch production secrets.
 */

import { DEMO_ACCOUNT_PASSWORD } from "@/constants/demo-accounts";
import { resetPermanentDemoAccounts } from "@/services/auth/demo-users";
import { ensurePlatformDemoEnvironment } from "@/services/demo/platform-demo-seed";
import { findUserByEmail, readAuthDb } from "@/services/auth/store";
import { PRIMARY_DEMO_EMAILS } from "@/constants/demo-accounts";
import { readCoursesDb } from "@/services/courses/store";
import { readBookingsDb } from "@/services/bookings/store";
import { readCgiDb } from "@/services/cgi/store";
import { readPerformanceDb } from "@/services/performance/store";

export type DemoResetResult = {
  password: string;
  accounts: Array<{ email: string; role: string; status: string }>;
  studentEnrollments: number;
  studentNotifications: number;
  studentBookings: number;
  cgiSubjectAssignments: number;
  performanceReports: number;
};

export function resetDemoEnvironment(options?: { password?: string }): DemoResetResult {
  const password = options?.password ?? DEMO_ACCOUNT_PASSWORD;
  resetPermanentDemoAccounts({ password });
  ensurePlatformDemoEnvironment();

  const student = findUserByEmail(PRIMARY_DEMO_EMAILS.student);
  const auth = readAuthDb();

  return {
    password,
    accounts: Object.values(PRIMARY_DEMO_EMAILS).map((email) => {
      const u = findUserByEmail(email);
      return {
        email,
        role: u?.role ?? "missing",
        status: u?.status ?? "missing",
      };
    }),
    studentEnrollments: student
      ? readCoursesDb().enrollments.filter(
          (e) => e.studentId === student.id && !["dropped", "rejected"].includes(e.status),
        ).length
      : 0,
    studentNotifications: student
      ? auth.notifications.filter((n) => n.userId === student.id).length
      : 0,
    studentBookings: student
      ? readBookingsDb().bookings.filter((b) => b.studentId === student.id).length
      : 0,
    cgiSubjectAssignments: readCgiDb().subjectAssignments.length,
    performanceReports: readPerformanceDb().reports.length,
  };
}
