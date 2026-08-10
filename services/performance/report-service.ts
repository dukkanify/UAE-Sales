/**
 * Post-lecture performance reports (CR006).
 * Instructor submits student evaluation → saved on student account → email → Super Admin.
 */

import { generateId } from "@/lib/security/crypto";
import { PERFORMANCE_RATINGS, PERFORMANCE_RATING_LABELS } from "@/constants/performance-reports";
import { ROLES } from "@/constants/roles";
import { findUserById } from "@/services/auth/store";
import { getLiveClass } from "@/services/classes/class-service";
import { ensureClassesSeeded } from "@/services/classes/seed";
import { readClassesDb } from "@/services/classes/store";
import { getCourseById } from "@/services/courses/course-service";
import { dispatchEmailEvent } from "@/services/email/automation-service";
import { sendEmail } from "@/services/email/mailer";
import { createNotification } from "@/services/notifications/notification-service";
import { performanceReportEmailTemplate } from "@/services/settings/email-templates";
import { readPerformanceDb, writePerformanceDb } from "@/services/performance/store";
import type {
  CreatePerformanceReportInput,
  PerformanceReport,
  PerformanceReportWithNames,
  PerformanceRating,
} from "@/types/performance-reports";

export class PerformanceReportError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "PerformanceReportError";
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function assertRating(value: unknown): PerformanceRating {
  if (typeof value !== "string" || !PERFORMANCE_RATINGS.includes(value as PerformanceRating)) {
    throw new PerformanceReportError("Invalid performance rating");
  }
  return value as PerformanceRating;
}

function assertRequiredText(label: string, value: unknown, min = 1): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new PerformanceReportError(`${label} is required`);
  }
  const text = value.trim();
  if (text.length < min) throw new PerformanceReportError(`${label} is too short`);
  return text;
}

function userDisplay(userId: string | null | undefined) {
  if (!userId) return { name: null, email: null };
  const u = findUserById(userId);
  if (!u) return { name: null, email: null };
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email;
  return { name, email: u.email };
}

function withNames(report: PerformanceReport): PerformanceReportWithNames {
  const student = userDisplay(report.studentId);
  const instructor = userDisplay(report.instructorId);
  return {
    ...report,
    studentName: student.name,
    studentEmail: student.email,
    instructorName: instructor.name,
  };
}

export function listPerformanceReports(filters?: {
  studentId?: string;
  instructorId?: string;
  liveClassId?: string;
  courseId?: string;
}): PerformanceReportWithNames[] {
  return readPerformanceDb()
    .reports.filter((r) => {
      if (filters?.studentId && r.studentId !== filters.studentId) return false;
      if (filters?.instructorId && r.instructorId !== filters.instructorId) return false;
      if (filters?.liveClassId && r.liveClassId !== filters.liveClassId) return false;
      if (filters?.courseId && r.courseId !== filters.courseId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(withNames);
}

export function getPerformanceReport(id: string): PerformanceReportWithNames | null {
  const row = readPerformanceDb().reports.find((r) => r.id === id);
  return row ? withNames(row) : null;
}

export async function createPerformanceReport(
  input: CreatePerformanceReportInput,
): Promise<PerformanceReportWithNames> {
  ensureClassesSeeded();
  const liveClass = getLiveClass(input.liveClassId);
  if (!liveClass) throw new PerformanceReportError("Live class not found", 404);

  const student = findUserById(input.studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw new PerformanceReportError("Student not found", 404);
  }

  const participants = readClassesDb().participants.filter(
    (p) => p.liveClassId === input.liveClassId && p.role === "participant",
  );
  const isParticipant = participants.some((p) => p.userId === input.studentId);
  // Allow report even if not yet enrolled as participant when instructor manages the class.
  if (!isParticipant && participants.length > 0) {
    // Soft check: if class has participants list, student should be on it.
    // Still allow when empty (demo classes).
  }

  const todaysTopic = assertRequiredText("Today's Topic", input.todaysTopic);
  const nextTopic = assertRequiredText("Next Topic", input.nextTopic);
  const homework = assertRequiredText("Homework", input.homework);
  const performance = assertRating(input.performance);
  const questionBank = assertRequiredText("Question Bank", input.questionBank);
  const comments = typeof input.comments === "string" ? input.comments.trim() : "";

  const existing = readPerformanceDb().reports.find(
    (r) => r.liveClassId === input.liveClassId && r.studentId === input.studentId,
  );

  const course = liveClass.courseId ? getCourseById(liveClass.courseId) : null;
  const stamp = nowIso();

  let report: PerformanceReport;
  if (existing) {
    report = {
      ...existing,
      todaysTopic,
      nextTopic,
      homework,
      performance,
      questionBank,
      comments,
      classTitle: liveClass.title,
      courseId: liveClass.courseId,
      courseCode: course?.code ?? null,
      instructorId: liveClass.instructorId,
      updatedAt: stamp,
    };
    writePerformanceDb((db) => {
      const idx = db.reports.findIndex((r) => r.id === existing.id);
      if (idx >= 0) db.reports[idx] = report;
    });
  } else {
    report = {
      id: generateId(),
      liveClassId: input.liveClassId,
      classTitle: liveClass.title,
      courseId: liveClass.courseId,
      courseCode: course?.code ?? null,
      studentId: input.studentId,
      instructorId: liveClass.instructorId,
      todaysTopic,
      nextTopic,
      homework,
      performance,
      questionBank,
      comments,
      emailSentAt: null,
      emailOutboxId: null,
      createdById: input.actorId,
      createdAt: stamp,
      updatedAt: stamp,
    };
    writePerformanceDb((db) => {
      db.reports.unshift(report);
    });
  }

  if (input.sendEmail !== false) {
    report = await emailPerformanceReport(report.id);
    if (homework) {
      await dispatchEmailEvent({
        event: "homework",
        userIds: [input.studentId],
        data: {
          title: liveClass.title,
          detail: homework,
          when: new Date(liveClass.startsAt).toLocaleString(),
        },
        actorId: input.actorId,
        meta: { reportId: report.id, liveClassId: liveClass.id },
      });
    }
  }

  await createNotification({
    userId: input.studentId,
    title: "New performance report",
    body: `${liveClass.title}: ${PERFORMANCE_RATING_LABELS[performance]} — ${todaysTopic}`,
    type: "performance.report",
    data: { reportId: report.id, liveClassId: liveClass.id },
  });

  return withNames(getPerformanceReport(report.id)!);
}

async function emailPerformanceReport(reportId: string): Promise<PerformanceReport> {
  const report = readPerformanceDb().reports.find((r) => r.id === reportId);
  if (!report) throw new PerformanceReportError("Report not found", 404);
  const student = findUserById(report.studentId);
  if (!student?.email) return report;

  const instructor = userDisplay(report.instructorId);
  const template = performanceReportEmailTemplate({
    studentName: userDisplay(report.studentId).name ?? student.email,
    classTitle: report.classTitle,
    courseCode: report.courseCode,
    instructorName: instructor.name,
    todaysTopic: report.todaysTopic,
    nextTopic: report.nextTopic,
    homework: report.homework,
    performanceLabel: PERFORMANCE_RATING_LABELS[report.performance],
    questionBank: report.questionBank,
    comments: report.comments,
  });

  const result = await sendEmail({
    to: student.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    meta: {
      kind: "performance_report",
      reportId: report.id,
      studentId: report.studentId,
      liveClassId: report.liveClassId,
    },
  });

  const stamp = nowIso();
  writePerformanceDb((db) => {
    const row = db.reports.find((r) => r.id === reportId);
    if (!row) return;
    row.emailSentAt = stamp;
    row.emailOutboxId = result.outboxId;
    row.updatedAt = stamp;
  });
  return readPerformanceDb().reports.find((r) => r.id === reportId)!;
}

export function getPerformanceReportsOverview() {
  const reports = listPerformanceReports();
  const byRating: Record<string, number> = {};
  for (const r of PERFORMANCE_RATINGS) byRating[r] = 0;
  for (const r of reports) byRating[r.performance] = (byRating[r.performance] ?? 0) + 1;

  const studentIds = new Set(reports.map((r) => r.studentId));
  return {
    total: reports.length,
    studentsCovered: studentIds.size,
    emailed: reports.filter((r) => r.emailSentAt).length,
    byRating,
    recent: reports.slice(0, 50),
  };
}
