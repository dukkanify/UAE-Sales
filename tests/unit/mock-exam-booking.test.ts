/**
 * Unit: Mock Exam Booking System (CR007).
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ROLES } from "@/constants/roles";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb } from "@/services/auth/store";
import { getMockExamSlots } from "@/services/mock-exams/availability-service";
import {
  bookMockExam,
  completeMockExamSession,
  getMockExamCertificate,
  getMockExamSettings,
  updateMockExamSettings,
} from "@/services/mock-exams/booking-service";
import { quoteMockExam } from "@/services/mock-exams/pricing-service";
import {
  readMockExamsDb,
  resetMockExamsDbCache,
  writeMockExamsDb,
} from "@/services/mock-exams/store";

describe("mock exam booking (CR007)", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    resetMockExamsDbCache();
    writeMockExamsDb((db) => {
      db.sessions = [];
      db.certificates = [];
      db.seeded = true;
      // Open every day 00–24 for predictable slots in tests
      db.settings.workingHours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
        weekday,
        startHour: 0,
        endHour: 24,
        active: true,
      }));
      db.settings.minNoticeMinutes = 0;
      db.settings.pricingMode = "dynamic";
      db.settings.peakStartHour = 16;
      db.settings.peakEndHour = 21;
      db.settings.autoCreateZoom = true;
      db.settings.autoIssueCertificate = true;
    });
  });

  it("quotes dynamic pricing and extra fees", () => {
    const exam = getMockExamSettings();
    expect(exam.enabled).toBe(true);
    const examType = readMockExamsDb().examTypes[0]!;

    const peak = new Date();
    peak.setUTCDate(peak.getUTCDate() + 3);
    peak.setUTCHours(17, 0, 0, 0);
    const peakQuote = quoteMockExam({
      examTypeId: examType.id,
      startsAt: peak.toISOString(),
    });
    expect(peakQuote.multiplier).toBe(examType.peakMultiplier);

    const rush = new Date(Date.now() + 24 * 3_600_000);
    rush.setUTCMinutes(0, 0, 0);
    const rushQuote = quoteMockExam({
      examTypeId: examType.id,
      startsAt: rush.toISOString(),
    });
    expect(rushQuote.extraFees.some((f) => f.code === "RUSH")).toBe(true);
  });

  it("books available slot with Zoom, completes session, issues certificate", async () => {
    const student = readAuthDb().users.find(
      (u) => u.role === ROLES.STUDENT && u.status === "active",
    )!;
    const examiner = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR)!;
    const examType = readMockExamsDb().examTypes[0]!;

    const day = new Date(Date.now() + 4 * 86_400_000);
    const date = day.toISOString().slice(0, 10);
    const slots = getMockExamSlots({
      date,
      examinerId: examiner.id,
      examTypeId: examType.id,
    });
    const open = slots.find((s) => s.available);
    expect(open).toBeTruthy();

    const session = await bookMockExam({
      studentId: student.id,
      examinerId: examiner.id,
      examTypeId: examType.id,
      startsAt: open!.startsAt,
      selectedExtraFeeIds: [],
      markPaid: true,
      actorId: student.id,
    });

    expect(session.status).toBe("confirmed");
    expect(session.zoom?.joinUrl).toBeTruthy();
    expect(session.quote.total).toBeGreaterThan(0);

    const completed = await completeMockExamSession({
      sessionId: session.id,
      scorePercent: 82,
      passed: true,
      notes: "Strong performance",
      actorId: examiner.id,
    });
    expect(completed.status).toBe("completed");
    expect(completed.certificateId).toBeTruthy();

    const cert = getMockExamCertificate(completed.certificateId!);
    expect(cert?.passed).toBe(true);
    expect(cert?.verificationCode).toMatch(/^ME-/);

    updateMockExamSettings({ pricingMode: "fixed" });
    expect(getMockExamSettings().pricingMode).toBe("fixed");
  });
});
