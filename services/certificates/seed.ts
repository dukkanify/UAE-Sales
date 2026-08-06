/**
 * Seed default certificate template + sample issued certificate for demo student.
 */

import { generateId } from "@/lib/security/crypto";
import { createHash, randomBytes } from "node:crypto";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, toUserProfile } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import { ensureCoursesSeeded } from "@/services/courses/seed";
import { listCourses } from "@/services/courses/course-service";
import { listStudentEnrollments } from "@/services/courses/enrollment-service";
import { DEFAULT_CERTIFICATE_BODY, CERTIFICATE_TEMPLATE_FIELDS } from "@/constants/certificates";
import { getPublicBrandConfig } from "@/services/settings/settings-service";
import { readCertificatesDb, writeCertificatesDb } from "@/services/certificates/store";
import type { Certificate, CertificateTemplate } from "@/types/certificates";

export function ensureCertificatesSeeded(): void {
  ensureDemoUsersSeeded();
  ensureCoursesSeeded();
  const db = readCertificatesDb();
  if (db.seeded && db.templates.length > 0) return;

  const brand = getPublicBrandConfig();
  const stamp = new Date().toISOString();
  const template: CertificateTemplate = {
    id: generateId(),
    name: "AviatorPass Classic",
    description: "Default landscape certificate with brand colors and QR verification.",
    isDefault: true,
    logoUrl: brand.logoUrl,
    backgroundUrl: null,
    primaryColor: brand.primaryColor || "#0B1F33",
    accentColor: brand.accentColor || "#C5A46E",
    signatureName: "AviatorPass Academic Board",
    signatureTitle: "Director of Training",
    signatureImageUrl: null,
    bodyHtml: DEFAULT_CERTIFICATE_BODY,
    fields: [...CERTIFICATE_TEMPLATE_FIELDS],
    createdAt: stamp,
    updatedAt: stamp,
    archivedAt: null,
  };

  const student = readAuthDb().users.find((u) => u.role === ROLES.STUDENT && u.status === "active");
  const course = listCourses({ pageSize: 20, status: "published" }).data[0];
  const certificates: Certificate[] = [];

  if (student && course) {
    const enrolled = listStudentEnrollments(student.id).some((e) => e.courseId === course.id);
    if (enrolled) {
      const verificationCode = randomBytes(8).toString("hex").toUpperCase();
      const certificateNumber = `ATPL-${new Date().getFullYear()}-DEMO01`;
      const profile = toUserProfile(student);
      const instructor = readAuthDb().users.find((u) => u.role === ROLES.INSTRUCTOR);
      certificates.push({
        id: generateId(),
        certificateNumber,
        verificationCode,
        studentId: student.id,
        studentName: profile.fullName || profile.email,
        courseId: course.id,
        courseName: course.title,
        instructorId: instructor?.id ?? null,
        instructorName: instructor
          ? toUserProfile(instructor).fullName || instructor.email
          : "Faculty",
        templateId: template.id,
        status: "issued",
        issueMode: "automatic",
        completionDate: stamp.slice(0, 10),
        issueDate: stamp.slice(0, 10),
        expiresAt: null,
        revokedAt: null,
        revokeReason: null,
        reissuedFromId: null,
        digitalSignature: createHash("sha256")
          .update(`${certificateNumber}|${student.id}|${course.id}`)
          .digest("hex"),
        qrPayload: `http://localhost:3000/verify/certificate?code=${verificationCode}`,
        approvedById: instructor?.id ?? null,
        approvedAt: stamp,
        metadata: { seeded: true },
        createdById: instructor?.id ?? null,
        createdAt: stamp,
        updatedAt: stamp,
      });
    }
  }

  writeCertificatesDb((d) => {
    d.templates = [template];
    d.certificates = certificates;
    d.completions = certificates.map((c) => ({
      id: generateId(),
      studentId: c.studentId,
      courseId: c.courseId!,
      completedAt: stamp,
      progressPercent: 100,
      learningHours: 12,
      certificateId: c.id,
      createdAt: stamp,
    }));
    d.seeded = true;
  });
}
