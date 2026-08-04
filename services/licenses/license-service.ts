/**
 * Commercial license service — secure PDF storage with version history.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { validateUpload, virusScanHook, UploadSecurityError } from "@/lib/security/upload";
import { readLicensesDb, writeLicensesDb } from "@/services/licenses/store";
import type {
  CommercialLicenseRecord,
  CommercialLicenseStatus,
  CommercialLicenseVersion,
} from "@/types/licenses";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "licenses");

export function listCommercialLicenses(): CommercialLicenseRecord[] {
  return readLicensesDb().licenses.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCommercialLicense(id: string): CommercialLicenseRecord | null {
  return readLicensesDb().licenses.find((l) => l.id === id) ?? null;
}

export async function createCommercialLicense(input: {
  title: string;
  issuer?: string;
  documentNumber?: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
  actorId: string | null;
}): Promise<CommercialLicenseRecord> {
  const now = new Date().toISOString();
  const record: CommercialLicenseRecord = {
    id: generateId(),
    title: input.title.trim() || "Commercial License",
    issuer: input.issuer?.trim() ?? "",
    documentNumber: input.documentNumber?.trim() ?? "",
    issuedAt: input.issuedAt ?? null,
    expiresAt: input.expiresAt ?? null,
    currentVersionId: null,
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
  writeLicensesDb((db) => {
    db.licenses.unshift(record);
  });
  return record;
}

export async function uploadLicenseVersion(input: {
  licenseId: string;
  file: File;
  versionLabel?: string;
  notes?: string;
  status?: CommercialLicenseStatus;
  actorId: string | null;
  maxBytes: number;
}): Promise<{ license: CommercialLicenseRecord; version: CommercialLicenseVersion }> {
  const license = getCommercialLicense(input.licenseId);
  if (!license) throw new UploadSecurityError("License not found", 404);

  let safeName: string;
  try {
    const validated = validateUpload({
      fileName: input.file.name,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
      maxBytes: input.maxBytes,
      allowedMimeTypes: ["application/pdf"],
    });
    safeName = validated.safeName;
  } catch (error) {
    if (error instanceof UploadSecurityError) throw error;
    throw error;
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const scan = await virusScanHook(buffer);
  if (!scan.clean) throw new UploadSecurityError("File failed security scan");

  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${input.licenseId.slice(0, 8)}-${generateId().slice(0, 10)}-${safeName}`;
  writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  const publicUrl = `/uploads/licenses/${filename}`;

  const now = new Date().toISOString();
  const version: CommercialLicenseVersion = {
    id: generateId(),
    versionLabel: input.versionLabel?.trim() || `v${license.versions.length + 1}`,
    fileName: input.file.name,
    mimeType: input.file.type || "application/pdf",
    sizeBytes: input.file.size,
    url: publicUrl,
    uploadedBy: input.actorId,
    uploadedAt: now,
    notes: input.notes?.trim() ?? "",
    status: input.status ?? "current",
  };

  let updated!: CommercialLicenseRecord;
  writeLicensesDb((db) => {
    const row = db.licenses.find((l) => l.id === input.licenseId);
    if (!row) throw new UploadSecurityError("License not found", 404);
    // Mark previous current as superseded
    for (const v of row.versions) {
      if (v.status === "current") v.status = "superseded";
    }
    row.versions.unshift(version);
    row.currentVersionId = version.id;
    row.updatedAt = now;
    updated = structuredClone(row);
  });

  return { license: updated, version };
}

export function updateLicenseMeta(input: {
  licenseId: string;
  title?: string;
  issuer?: string;
  documentNumber?: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
}): CommercialLicenseRecord {
  let updated!: CommercialLicenseRecord;
  writeLicensesDb((db) => {
    const row = db.licenses.find((l) => l.id === input.licenseId);
    if (!row) throw new UploadSecurityError("License not found", 404);
    if (input.title != null) row.title = input.title.trim();
    if (input.issuer != null) row.issuer = input.issuer.trim();
    if (input.documentNumber != null) row.documentNumber = input.documentNumber.trim();
    if (input.issuedAt !== undefined) row.issuedAt = input.issuedAt;
    if (input.expiresAt !== undefined) row.expiresAt = input.expiresAt;
    row.updatedAt = new Date().toISOString();
    updated = structuredClone(row);
  });
  return updated;
}
