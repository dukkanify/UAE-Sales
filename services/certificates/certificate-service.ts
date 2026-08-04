/**
 * Certificate issuance, approval, revocation, reissue.
 */

import { createHash, randomBytes } from "node:crypto";
import QRCode from "qrcode";

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { siteConfig } from "@/config/site";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { getCourseById } from "@/services/courses/course-service";
import { getCourseLearningState } from "@/services/learning/progress-service";
import {
  assertCanManageCertificates,
  CertificateError,
} from "@/services/certificates/access";
import { getDefaultTemplate, getTemplateById } from "@/services/certificates/template-service";
import { readCertificatesDb, writeCertificatesDb } from "@/services/certificates/store";
import { getPublicBrandConfig } from "@/services/settings/settings-service";
import type {
  Certificate,
  CertificateIssueMode,
  CertificateStatus,
} from "@/types/certificates";
import type { UserProfile } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function makeCertificateNumber(): string {
  const y = new Date().getFullYear();
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `ATPL-${y}-${rand}`;
}

function makeVerificationCode(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

function signCertificatePayload(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

function publicVerifyUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/verify/certificate?code=${encodeURIComponent(code)}`;
}

export function listCertificates(filters?: {
  studentId?: string;
  status?: CertificateStatus | "all";
  courseId?: string;
}): Certificate[] {
  let rows = readCertificatesDb().certificates;
  if (filters?.studentId) rows = rows.filter((c) => c.studentId === filters.studentId);
  if (filters?.courseId) rows = rows.filter((c) => c.courseId === filters.courseId);
  if (filters?.status && filters.status !== "all") {
    rows = rows.filter((c) => c.status === filters.status);
  }
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCertificateById(id: string): Certificate | null {
  return readCertificatesDb().certificates.find((c) => c.id === id) ?? null;
}

export function findCertificateByVerification(
  query: string,
): Certificate | null {
  const q = query.trim().toUpperCase();
  return (
    readCertificatesDb().certificates.find(
      (c) =>
        c.verificationCode.toUpperCase() === q ||
        c.certificateNumber.toUpperCase() === q ||
        c.id === query.trim(),
    ) ?? null
  );
}

export async function createCertificate(input: {
  user: UserProfile;
  studentId: string;
  courseId: string;
  templateId?: string | null;
  issueMode?: CertificateIssueMode;
  completionDate?: string;
  expiresAt?: string | null;
  autoApprove?: boolean;
}): Promise<Certificate> {
  assertCanManageCertificates(input.user);

  const existing = listCertificates({
    studentId: input.studentId,
    courseId: input.courseId,
  }).find((c) => c.status === "issued" || c.status === "pending_approval");
  if (existing) {
    throw new CertificateError(
      "An active or pending certificate already exists for this student and course",
    );
  }

  const student = readAuthDb().users.find((u) => u.id === input.studentId);
  if (!student) throw new CertificateError("Student not found", 404);
  const course = getCourseById(input.courseId);
  if (!course) throw new CertificateError("Course not found", 404);

  const template =
    (input.templateId ? getTemplateById(input.templateId) : null) ??
    getDefaultTemplate();
  if (!template) throw new CertificateError("No certificate template configured");

  let instructorName = "ATPL PASS Faculty";
  const instructorId: string | null = course.primaryInstructorId;
  if (instructorId) {
    const instructor = readAuthDb().users.find((u) => u.id === instructorId);
    if (instructor) instructorName = toUserProfile(instructor).fullName || "Faculty";
  }

  const stamp = nowIso();
  const verificationCode = makeVerificationCode();
  const certificateNumber = makeCertificateNumber();
  const qrPayload = publicVerifyUrl(verificationCode);
  const digitalSignature = signCertificatePayload(
    `${certificateNumber}|${input.studentId}|${input.courseId}|${verificationCode}`,
  );

  const autoApprove = input.autoApprove ?? input.issueMode === "automatic";
  const status: CertificateStatus = autoApprove ? "issued" : "pending_approval";

  const certificate: Certificate = {
    id: generateId(),
    certificateNumber,
    verificationCode,
    studentId: input.studentId,
    studentName: toUserProfile(student).fullName || student.email,
    courseId: input.courseId,
    courseName: course.title,
    instructorId,
    instructorName,
    templateId: template.id,
    status,
    issueMode: input.issueMode ?? "manual",
    completionDate: input.completionDate ?? stamp.slice(0, 10),
    issueDate: autoApprove ? stamp.slice(0, 10) : null,
    expiresAt: input.expiresAt ?? null,
    revokedAt: null,
    revokeReason: null,
    reissuedFromId: null,
    digitalSignature,
    qrPayload,
    approvedById: autoApprove ? input.user.id : null,
    approvedAt: autoApprove ? stamp : null,
    metadata: {},
    createdById: input.user.id,
    createdAt: stamp,
    updatedAt: stamp,
  };

  writeCertificatesDb((d) => {
    d.certificates.unshift(certificate);
    if (autoApprove) {
      d.completions.push({
        id: generateId(),
        studentId: input.studentId,
        courseId: input.courseId,
        completedAt: stamp,
        progressPercent: 100,
        learningHours: 0,
        certificateId: certificate.id,
        createdAt: stamp,
      });
    }
  });

  await logActivity({
    actorId: input.user.id,
    action: autoApprove
      ? ACTIVITY_ACTIONS.CERTIFICATE_ISSUED
      : ACTIVITY_ACTIONS.CERTIFICATE_CREATED,
    entityType: "certificate",
    entityId: certificate.id,
    metadata: { courseId: input.courseId, studentId: input.studentId },
  });

  return certificate;
}

/** Auto-issue when course learning progress reaches 100%. */
export async function maybeAutoIssueCertificate(input: {
  actor: UserProfile;
  studentId: string;
  courseId: string;
}): Promise<Certificate | null> {
  try {
    const state = getCourseLearningState(input.studentId, input.courseId);
    if (state.progressPercent < 100) return null;
  } catch {
    return null;
  }
  const existing = listCertificates({
    studentId: input.studentId,
    courseId: input.courseId,
  }).find((c) => ["issued", "pending_approval", "reissued"].includes(c.status));
  if (existing) return existing;

  return createCertificate({
    user: input.actor,
    studentId: input.studentId,
    courseId: input.courseId,
    issueMode: "automatic",
    autoApprove: true,
  });
}

export async function approveCertificate(
  user: UserProfile,
  id: string,
): Promise<Certificate> {
  assertCanManageCertificates(user);
  const existing = getCertificateById(id);
  if (!existing) throw new CertificateError("Certificate not found", 404);
  if (existing.status !== "pending_approval" && existing.status !== "draft") {
    throw new CertificateError("Certificate cannot be approved in its current status");
  }
  const stamp = nowIso();
  writeCertificatesDb((d) => {
    const idx = d.certificates.findIndex((c) => c.id === id);
    if (idx >= 0) {
      d.certificates[idx] = {
        ...d.certificates[idx]!,
        status: "issued",
        issueDate: stamp.slice(0, 10),
        approvedById: user.id,
        approvedAt: stamp,
        updatedAt: stamp,
      };
    }
  });
  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.CERTIFICATE_APPROVED,
    entityType: "certificate",
    entityId: id,
  });
  return getCertificateById(id)!;
}

export async function revokeCertificate(input: {
  user: UserProfile;
  id: string;
  reason: string;
}): Promise<Certificate> {
  assertCanManageCertificates(input.user);
  const existing = getCertificateById(input.id);
  if (!existing) throw new CertificateError("Certificate not found", 404);
  if (existing.status === "revoked") {
    throw new CertificateError("Certificate already revoked");
  }
  const stamp = nowIso();
  writeCertificatesDb((d) => {
    const idx = d.certificates.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      d.certificates[idx] = {
        ...d.certificates[idx]!,
        status: "revoked",
        revokedAt: stamp,
        revokeReason: input.reason || "Revoked by administrator",
        updatedAt: stamp,
      };
    }
  });
  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.CERTIFICATE_REVOKED,
    entityType: "certificate",
    entityId: input.id,
    metadata: { reason: input.reason },
  });
  return getCertificateById(input.id)!;
}

export async function reissueCertificate(input: {
  user: UserProfile;
  id: string;
}): Promise<Certificate> {
  assertCanManageCertificates(input.user);
  const existing = getCertificateById(input.id);
  if (!existing) throw new CertificateError("Certificate not found", 404);
  if (!existing.courseId) throw new CertificateError("Cannot reissue without course");

  // Mark old as reissued lineage
  const stamp = nowIso();
  writeCertificatesDb((d) => {
    const idx = d.certificates.findIndex((c) => c.id === input.id);
    if (idx >= 0 && d.certificates[idx]!.status === "issued") {
      d.certificates[idx] = {
        ...d.certificates[idx]!,
        status: "reissued",
        updatedAt: stamp,
      };
    }
  });

  const fresh = await createCertificate({
    user: input.user,
    studentId: existing.studentId,
    courseId: existing.courseId,
    templateId: existing.templateId,
    issueMode: "manual",
    completionDate: existing.completionDate,
    expiresAt: existing.expiresAt,
    autoApprove: true,
  });

  writeCertificatesDb((d) => {
    const idx = d.certificates.findIndex((c) => c.id === fresh.id);
    if (idx >= 0) {
      d.certificates[idx] = {
        ...d.certificates[idx]!,
        reissuedFromId: existing.id,
        updatedAt: nowIso(),
      };
    }
  });

  await logActivity({
    actorId: input.user.id,
    action: ACTIVITY_ACTIONS.CERTIFICATE_REISSUED,
    entityType: "certificate",
    entityId: fresh.id,
    metadata: { from: existing.id },
  });

  return getCertificateById(fresh.id)!;
}

export async function renderCertificateHtml(certificateId: string): Promise<{
  html: string;
  certificate: Certificate;
  qrDataUrl: string;
}> {
  const certificate = getCertificateById(certificateId);
  if (!certificate) throw new CertificateError("Certificate not found", 404);
  const template = getTemplateById(certificate.templateId) ?? getDefaultTemplate();
  if (!template) throw new CertificateError("Template missing", 404);
  const brand = getPublicBrandConfig();
  const org = brand.platformName || siteConfig.name;

  const values: Record<string, string> = {
    studentName: certificate.studentName,
    courseName: certificate.courseName,
    instructorName: certificate.instructorName,
    completionDate: certificate.completionDate,
    issueDate: certificate.issueDate ?? "—",
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    organizationName: org,
  };

  let body = template.bodyHtml;
  for (const [key, value] of Object.entries(values)) {
    body = body.replaceAll(`{{${key}}}`, value);
  }

  const qrDataUrl = await QRCode.toDataURL(certificate.qrPayload, {
    margin: 1,
    width: 180,
    color: { dark: template.primaryColor, light: "#ffffff" },
  });

  const logo = template.logoUrl || brand.logoUrl || "/brand/logo.svg";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${certificate.certificateNumber}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #f5f5f5; }
  .sheet {
    width: 1100px; min-height: 760px; margin: 24px auto; padding: 48px 64px;
    background: linear-gradient(135deg, #fff 0%, #faf7f2 100%);
    border: 12px solid ${template.primaryColor};
    box-shadow: 0 10px 40px rgba(0,0,0,.12);
    position: relative; color: ${template.primaryColor};
  }
  .accent { height: 6px; background: ${template.accentColor}; margin: 16px 0 28px; }
  img.logo { height: 56px; }
  h1 { font-size: 28px; letter-spacing: .08em; text-transform: uppercase; margin: 0; }
  h2 { font-size: 42px; margin: 8px 0; color: ${template.accentColor}; }
  h3 { font-size: 26px; margin: 8px 0 24px; }
  .eyebrow { letter-spacing: .2em; text-transform: uppercase; font-size: 12px; opacity: .7; }
  .recipient, .body, .meta { font-size: 16px; }
  .footer { display:flex; justify-content: space-between; align-items:flex-end; margin-top: 48px; }
  .sig { border-top: 1px solid ${template.primaryColor}; padding-top: 8px; min-width: 220px; }
  .sig strong { display:block; }
  .qr { text-align:center; font-size: 11px; }
  .verify { margin-top: 8px; font-family: ui-monospace, monospace; }
  .status { position:absolute; top: 24px; right: 32px; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="status">${certificate.status}</div>
    <img class="logo" src="${logo}" alt="Logo"/>
    <div class="accent"></div>
    ${body}
    <div class="footer">
      <div class="sig">
        <strong>${template.signatureName}</strong>
        <span>${template.signatureTitle}</span>
      </div>
      <div class="qr">
        <img src="${qrDataUrl}" alt="Verification QR" width="120" height="120"/>
        <div class="verify">${certificate.verificationCode}</div>
        <div>Scan to verify</div>
      </div>
      <div class="sig" style="text-align:right">
        <strong>Digital signature</strong>
        <span style="font-size:10px;word-break:break-all">${certificate.digitalSignature.slice(0, 24)}…</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { html, certificate, qrDataUrl };
}
