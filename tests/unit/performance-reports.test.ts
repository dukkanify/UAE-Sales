/**
 * Unit: post-lecture performance reports (CR006).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import { generateId } from "@/lib/security/crypto";
import {
  createPerformanceReport,
  getPerformanceReportsOverview,
  listPerformanceReports,
} from "@/services/performance/report-service";
import { resetPerformanceDbCache, writePerformanceDb } from "@/services/performance/store";
import { listOutboundEmails } from "@/services/email/outbox";

describe("performance reports (CR006)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    ensureClassesSeeded();
    resetPerformanceDbCache();
    writePerformanceDb((db) => {
      db.reports = [];
    });
  });

  it("saves report on student account, emails, and surfaces for Super Admin", async () => {
    const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;
    const liveClass =
      readClassesDb().classes.find((c) => !c.deletedAt && c.instructorId === instructor.id) ??
      readClassesDb().classes.find((c) => !c.deletedAt)!;

    writeClassesDb((d) => {
      const has = d.participants.some(
        (p) => p.liveClassId === liveClass.id && p.userId === student.id,
      );
      if (!has) {
        d.participants.push({
          id: generateId(),
          liveClassId: liveClass.id,
          userId: student.id,
          role: "participant",
          invitedAt: new Date().toISOString(),
          joinedAt: null,
        });
      }
    });

    const report = await createPerformanceReport({
      liveClassId: liveClass.id,
      studentId: student.id,
      todaysTopic: "Air law — privileges of licence holders",
      nextTopic: "Flight rules and ATC clearances",
      homework: "Complete QB set 1 questions 1–20",
      performance: "good",
      questionBank: "ATPL-010 bank · set 1",
      comments: "Strong oral answers; review night VFR notes.",
      actorId: instructor.id,
      sendEmail: true,
    });

    expect(report.todaysTopic).toContain("Air law");
    expect(report.studentId).toBe(student.id);
    expect(report.emailSentAt).toBeTruthy();

    const studentReports = listPerformanceReports({ studentId: student.id });
    expect(studentReports).toHaveLength(1);
    expect(studentReports[0]?.questionBank).toContain("ATPL-010");

    const overview = getPerformanceReportsOverview();
    expect(overview.total).toBe(1);
    expect(overview.emailed).toBe(1);
    expect(overview.byRating.good).toBe(1);

    const mailed = listOutboundEmails().filter(
      (e) => (e.meta as { kind?: string } | undefined)?.kind === "performance_report",
    );
    expect(mailed.length).toBeGreaterThan(0);
    expect(mailed[0]?.to).toBe(student.email);
  });
});
