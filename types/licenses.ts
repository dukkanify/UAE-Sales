/**
 * Commercial license document types — Super Admin only.
 */

export type CommercialLicenseStatus = "current" | "expired" | "superseded" | "draft";

export interface CommercialLicenseVersion {
  id: string;
  versionLabel: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  uploadedBy: string | null;
  uploadedAt: string;
  notes: string;
  status: CommercialLicenseStatus;
}

export interface CommercialLicenseRecord {
  id: string;
  title: string;
  issuer: string;
  documentNumber: string;
  issuedAt: string | null;
  expiresAt: string | null;
  currentVersionId: string | null;
  versions: CommercialLicenseVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface CommercialLicenseDatabase {
  licenses: CommercialLicenseRecord[];
  seeded: boolean;
}
