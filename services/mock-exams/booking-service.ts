/**
 * Mock Exam booking, Zoom, completion, certificate (CR007).
 */

import { generateId, generateToken } from "@/lib/security/crypto";
import { ROLES } from "@/constants/roles";
import { findUserById } from "@/services/auth/store";
import { provisionStandaloneZoomMeeting } from "@/services/classes/zoom-service";
import { createNotification } from "@/services/notifications/notification-service";
import { sendEmail } from "@/services/email/mailer";
import { renderBrandedEmail } from "@/services/settings/email-templates";
import { getMockExamSlots, listMockExaminers } from "@/services/mock-exams/availability-service";
import { MockExamError, quoteMockExam } from "@/services/mock-exams/pricing-service";
import {
  ensureMockExamsSeeded,
  readMockExamsDb,
  writeMockExamsDb,
} from "@/services/mock-exams/store";
import { formatMinor } from "@/services/payments/money";
import type {
  MockExamCertificate,
  MockExamExtraFee,
  MockExamSettings,
  MockExamSession,
  MockExamSessionWithNames,
  MockExamType,
  MockExamWorkingHours,
} from "@/types/mock-exams";

function nowIso() {
  return new Date().toISOString();
}

function displayName(userId: string) {
  const u = findUserById(userId);
  if (!u) return { name: null, email: null };
  return {
    name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email,
    email: u.email,
  };
}

function withNames(session: MockExamSession): MockExamSessionWithNames {
  const student = displayName(session.studentId);
  const examiner = displayName(session.examinerId);
  return {
    ...session,
    studentName: student.name,
    studentEmail: student.email,
    examinerName: examiner.name,
  };
}

export function getMockExamSettings(): MockExamSettings {
  ensureMockExamsSeeded();
  return readMockExamsDb().settings;
}

export function listMockExamTypes(): MockExamType[] {
  ensureMockExamsSeeded();
  return readMockExamsDb().examTypes.filter((t) => t.active);
}

export function listMockExamExtraFees(): MockExamExtraFee[] {
  ensureMockExamsSeeded();
  return readMockExamsDb().extraFees.filter((f) => f.active);
}

export function updateMockExamSettings(
  patch: Partial<MockExamSettings> & {
    examTypes?: MockExamType[];
    extraFees?: MockExamExtraFee[];
  },
): {
  settings: MockExamSettings;
  examTypes: MockExamType[];
  extraFees: MockExamExtraFee[];
} {
  ensureMockExamsSeeded();
  writeMockExamsDb((db) => {
    const { examTypes, extraFees, ...settingsPatch } = patch;
    db.settings = {
      ...db.settings,
      ...settingsPatch,
      updatedAt: nowIso(),
    };
    if (Array.isArray(examTypes)) db.examTypes = examTypes;
    if (Array.isArray(extraFees)) db.extraFees = extraFees;
  });
  const db = readMockExamsDb();
  return { settings: db.settings, examTypes: db.examTypes, extraFees: db.extraFees };
}

export function listMockExamSessions(filters?: {
  studentId?: string;
  examinerId?: string;
  status?: string;
}): MockExamSessionWithNames[] {
  ensureMockExamsSeeded();
  return readMockExamsDb()
    .sessions.filter((s) => {
      if (filters?.studentId && s.studentId !== filters.studentId) return false;
      if (filters?.examinerId && s.examinerId !== filters.examinerId) return false;
      if (filters?.status && s.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .map(withNames);
}

export function getMockExamSession(id: string): MockExamSessionWithNames | null {
  const row = readMockExamsDb().sessions.find((s) => s.id === id);
  return row ? withNames(row) : null;
}

async function provisionZoom(session: MockExamSession): Promise<MockExamSession> {
  const settings = getMockExamSettings();
  if (!settings.autoCreateZoom) return session;
  const zoom = await provisionStandaloneZoomMeeting({
    topic: `Mock Exam — ${session.examTypeName}`,
    agenda: `Student mock exam session ${session.id}`,
    startsAt: session.startsAt,
    durationMinutes: session.durationMinutes,
    timezone: session.timezone,
    mockJoinPath: `/mock-exams/join/${session.id}`,
    waitingRoom: settings.zoomWaitingRoom,
    passcode: settings.zoomPasscode,
    actorId: session.examinerId,
  });
  const stamp = nowIso();
  writeMockExamsDb((db) => {
    const row = db.sessions.find((s) => s.id === session.id);
    if (!row) return;
    row.zoom = {
      meetingNumber: zoom.meetingNumber,
      joinUrl: zoom.joinUrl,
      startUrl: zoom.startUrl,
      password: zoom.password,
      waitingRoom: zoom.waitingRoom,
      providerMode: zoom.providerMode,
      provisionedAt: stamp,
    };
    row.updatedAt = stamp;
  });
  return readMockExamsDb().sessions.find((s) => s.id === session.id)!;
}

export async function bookMockExam(input: {
  studentId: string;
  examinerId: string;
  examTypeId: string;
  startsAt: string;
  selectedExtraFeeIds?: string[];
  /** When true, mark paid immediately (demo / admin-confirmed) */
  markPaid?: boolean;
  actorId: string;
}): Promise<MockExamSessionWithNames> {
  ensureMockExamsSeeded();
  const settings = getMockExamSettings();
  if (!settings.enabled) throw new MockExamError("Mock exam booking is disabled", 403);

  const student = findUserById(input.studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw new MockExamError("Student not found", 404);
  }
  if (!listMockExaminers().some((e) => e.id === input.examinerId)) {
    throw new MockExamError("Examiner not available", 400);
  }

  const exam = readMockExamsDb().examTypes.find((t) => t.id === input.examTypeId && t.active);
  if (!exam) throw new MockExamError("Exam type not available", 404);

  const startsAtIso = new Date(input.startsAt).toISOString();
  const date = startsAtIso.slice(0, 10);
  const slots = getMockExamSlots({
    date,
    examinerId: input.examinerId,
    examTypeId: input.examTypeId,
    selectedExtraFeeIds: input.selectedExtraFeeIds,
  });
  const targetMs = Date.parse(startsAtIso);
  const slot = slots.find((s) => Date.parse(s.startsAt) === targetMs && s.available);
  if (!slot) {
    throw new MockExamError("Selected slot is not available", 409);
  }

  const quote = quoteMockExam({
    examTypeId: input.examTypeId,
    startsAt: slot.startsAt,
    selectedExtraFeeIds: input.selectedExtraFeeIds,
  });

  const stamp = nowIso();
  const endsAt = new Date(Date.parse(slot.startsAt) + exam.durationMinutes * 60_000).toISOString();

  let session: MockExamSession = {
    id: generateId(),
    examTypeId: exam.id,
    examTypeName: exam.name,
    studentId: input.studentId,
    examinerId: input.examinerId,
    startsAt: slot.startsAt,
    endsAt,
    durationMinutes: exam.durationMinutes,
    status: input.markPaid ? "confirmed" : "pending_payment",
    timezone: settings.timezone,
    currency: settings.currency,
    quote,
    selectedExtraFeeIds: input.selectedExtraFeeIds ?? [],
    zoom: null,
    certificateId: null,
    scorePercent: null,
    passed: null,
    completionNotes: null,
    paidAt: input.markPaid ? stamp : null,
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeMockExamsDb((db) => {
    db.sessions.unshift(session);
  });

  if (session.status === "confirmed") {
    session = await provisionZoom(session);
  }

  await createNotification({
    userId: input.studentId,
    title: "Mock exam booked",
    body: `${exam.name} on ${new Date(session.startsAt).toLocaleString()} · ${formatMinor(quote.total, quote.currency)}`,
    type: "mock_exam.booked",
    data: { sessionId: session.id },
  });

  return withNames(getMockExamSession(session.id)!);
}

export async function confirmMockExamPayment(
  sessionId: string,
  actorId: string,
): Promise<MockExamSessionWithNames> {
  const existing = readMockExamsDb().sessions.find((s) => s.id === sessionId);
  if (!existing) throw new MockExamError("Session not found", 404);
  if (existing.status !== "pending_payment") {
    throw new MockExamError("Session is not awaiting payment");
  }
  const stamp = nowIso();
  writeMockExamsDb((db) => {
    const row = db.sessions.find((s) => s.id === sessionId);
    if (!row) return;
    row.status = "confirmed";
    row.paidAt = stamp;
    row.updatedAt = stamp;
  });
  let session = readMockExamsDb().sessions.find((s) => s.id === sessionId)!;
  session = await provisionZoom(session);
  void actorId;
  return withNames(session);
}

export async function completeMockExamSession(input: {
  sessionId: string;
  scorePercent: number;
  passed: boolean;
  notes?: string | null;
  actorId: string;
}): Promise<MockExamSessionWithNames> {
  const existing = readMockExamsDb().sessions.find((s) => s.id === input.sessionId);
  if (!existing) throw new MockExamError("Session not found", 404);
  if (!["confirmed", "in_progress"].includes(existing.status)) {
    throw new MockExamError("Only confirmed or in-progress sessions can be completed");
  }
  if (input.scorePercent < 0 || input.scorePercent > 100) {
    throw new MockExamError("scorePercent must be 0–100");
  }

  const stamp = nowIso();
  writeMockExamsDb((db) => {
    const row = db.sessions.find((s) => s.id === input.sessionId);
    if (!row) return;
    row.status = "completed";
    row.scorePercent = input.scorePercent;
    row.passed = input.passed;
    row.completionNotes = input.notes?.trim() || null;
    row.completedAt = stamp;
    row.updatedAt = stamp;
  });

  let session = readMockExamsDb().sessions.find((s) => s.id === input.sessionId)!;
  const settings = getMockExamSettings();
  if (settings.autoIssueCertificate && input.passed) {
    const cert = issueMockExamCertificate(session);
    writeMockExamsDb((db) => {
      const row = db.sessions.find((s) => s.id === input.sessionId);
      if (row) {
        row.certificateId = cert.id;
        row.updatedAt = nowIso();
      }
    });
    session = readMockExamsDb().sessions.find((s) => s.id === input.sessionId)!;
    await emailCertificate(session, cert);
  }

  await createNotification({
    userId: session.studentId,
    title: input.passed ? "Mock exam passed" : "Mock exam completed",
    body: `${session.examTypeName}: ${input.scorePercent}%${input.passed ? " — certificate issued" : ""}`,
    type: "mock_exam.completed",
    data: { sessionId: session.id, certificateId: session.certificateId },
  });

  return withNames(session);
}

function issueMockExamCertificate(session: MockExamSession): MockExamCertificate {
  const student = displayName(session.studentId);
  const verificationCode = `ME-${generateToken(8)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10)}`;
  const stamp = nowIso();
  const htmlSnapshot = `<!doctype html><html><body style="font-family:Georgia,serif;text-align:center;padding:48px;">
    <h1>Mock Exam Certificate</h1>
    <p>This certifies that</p>
    <h2>${student.name ?? "Candidate"}</h2>
    <p>completed <strong>${session.examTypeName}</strong></p>
    <p>Score: ${session.scorePercent ?? "—"}% · Result: ${session.passed ? "PASS" : "FAIL"}</p>
    <p>Date: ${stamp.slice(0, 10)}</p>
    <p>Verification: ${verificationCode}</p>
  </body></html>`;

  const cert: MockExamCertificate = {
    id: generateId(),
    sessionId: session.id,
    studentId: session.studentId,
    studentName: student.name ?? "Candidate",
    examTypeName: session.examTypeName,
    scorePercent: session.scorePercent,
    passed: Boolean(session.passed),
    verificationCode,
    issuedAt: stamp,
    htmlSnapshot,
  };
  writeMockExamsDb((db) => {
    db.certificates.unshift(cert);
  });
  return cert;
}

async function emailCertificate(session: MockExamSession, cert: MockExamCertificate) {
  const student = displayName(session.studentId);
  if (!student.email) return;
  const template = renderBrandedEmail({
    title: "Mock exam certificate",
    preheader: `${session.examTypeName} · ${cert.passed ? "PASS" : "FAIL"}`,
    bodyHtml: `<p>Hello ${student.name ?? "Candidate"},</p>
      <p>Your mock exam <strong>${session.examTypeName}</strong> is complete.</p>
      <p>Score: <strong>${cert.scorePercent ?? "—"}%</strong> · ${cert.passed ? "PASS" : "Completed"}</p>
      <p>Verification code: <strong>${cert.verificationCode}</strong></p>
      <p>Open AviatorPass → Mock Exams to view your certificate.</p>`,
  });
  await sendEmail({
    to: student.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    meta: { kind: "mock_exam_certificate", sessionId: session.id, certificateId: cert.id },
  });
}

export function getMockExamCertificate(id: string): MockExamCertificate | null {
  return readMockExamsDb().certificates.find((c) => c.id === id) ?? null;
}

export function getMockExamCatalog() {
  ensureMockExamsSeeded();
  const settings = getMockExamSettings();
  return {
    settings: {
      enabled: settings.enabled,
      currency: settings.currency,
      timezone: settings.timezone,
      pricingMode: settings.pricingMode,
      workingHours: settings.workingHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      minNoticeMinutes: settings.minNoticeMinutes,
    },
    examTypes: listMockExamTypes(),
    extraFees: listMockExamExtraFees(),
    examiners: listMockExaminers(),
  };
}

export function getMockExamAdminOverview() {
  const sessions = listMockExamSessions();
  return {
    settings: getMockExamSettings(),
    examTypes: readMockExamsDb().examTypes,
    extraFees: readMockExamsDb().extraFees,
    examiners: listMockExaminers(),
    counts: {
      total: sessions.length,
      pendingPayment: sessions.filter((s) => s.status === "pending_payment").length,
      confirmed: sessions.filter((s) => s.status === "confirmed").length,
      completed: sessions.filter((s) => s.status === "completed").length,
      certificates: readMockExamsDb().certificates.length,
    },
    recent: sessions.slice(0, 30),
  };
}

export type { MockExamWorkingHours };
