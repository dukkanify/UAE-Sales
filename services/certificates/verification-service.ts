/**
 * Public certificate verification.
 */

import { siteConfig } from "@/config/site";
import { getPublicBrandConfig } from "@/services/settings/settings-service";
import { findCertificateByVerification } from "@/services/certificates/certificate-service";
import { ensureCertificatesSeeded } from "@/services/certificates/seed";
import type { PublicVerificationResult } from "@/types/certificates";

export function verifyCertificatePublic(query: string): PublicVerificationResult {
  ensureCertificatesSeeded();
  const brand = getPublicBrandConfig();
  const org = brand.platformName || siteConfig.name;
  const empty: PublicVerificationResult = {
    valid: false,
    certificateNumber: null,
    studentName: null,
    courseName: null,
    issueDate: null,
    status: null,
    validity: "not_found",
    organizationName: org,
    instructorName: null,
  };

  if (!query.trim()) return empty;
  const cert = findCertificateByVerification(query);
  if (!cert) return empty;

  let validity: PublicVerificationResult["validity"] = "valid";
  if (cert.status === "revoked") validity = "revoked";
  else if (cert.status === "expired") validity = "expired";
  else if (cert.status === "pending_approval" || cert.status === "draft") validity = "pending";
  else if (cert.expiresAt && Date.parse(cert.expiresAt) < Date.now()) validity = "expired";
  else if (cert.status === "issued" || cert.status === "reissued") validity = "valid";
  else validity = "pending";

  return {
    valid: validity === "valid",
    certificateNumber: cert.certificateNumber,
    studentName: cert.studentName,
    courseName: cert.courseName,
    issueDate: cert.issueDate,
    status: cert.status,
    validity,
    organizationName: org,
    instructorName: cert.instructorName,
  };
}
