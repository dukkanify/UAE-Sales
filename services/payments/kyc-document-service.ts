/**
 * Student KYC documents — passport upload for installment / BNPL (CR003).
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { validateUpload } from "@/lib/security/upload";
import { readPaymentsDb, writePaymentsDb } from "@/services/payments/store";
import type { StudentKycDocument } from "@/types/payments";

function nowIso() {
  return new Date().toISOString();
}

const KYC_DIR = path.join(process.cwd(), "public", "uploads", "kyc");

export function listKycDocuments(userId?: string): StudentKycDocument[] {
  const rows = readPaymentsDb().kycDocuments;
  return (userId ? rows.filter((d) => d.userId === userId) : rows).sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );
}

export function getLatestPassport(userId: string): StudentKycDocument | null {
  return (
    listKycDocuments(userId).find(
      (d) => d.kind === "passport" && (d.status === "uploaded" || d.status === "verified"),
    ) ?? null
  );
}

export function hasUsablePassport(userId: string): boolean {
  const doc = getLatestPassport(userId);
  return Boolean(doc && (doc.status === "uploaded" || doc.status === "verified"));
}

export async function uploadPassport(input: {
  userId: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
}): Promise<StudentKycDocument> {
  const validated = validateUpload({
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.bytes.length,
    maxBytes: 8 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  });

  if (!existsSync(KYC_DIR)) mkdirSync(KYC_DIR, { recursive: true });
  const id = generateId();
  const safe = validated.safeName;
  const storageName = `${input.userId}-${id}-${safe}`;
  const storagePath = path.join(KYC_DIR, storageName);
  writeFileSync(storagePath, input.bytes);

  const stamp = nowIso();
  const doc: StudentKycDocument = {
    id,
    userId: input.userId,
    kind: "passport",
    status: "uploaded",
    fileName: safe,
    mimeType: validated.mimeType,
    sizeBytes: input.bytes.length,
    storagePath,
    publicUrl: `/uploads/kyc/${storageName}`,
    rejectionReason: null,
    verifiedAt: null,
    verifiedById: null,
    uploadedAt: stamp,
    updatedAt: stamp,
  };

  writePaymentsDb((db) => {
    db.kycDocuments.unshift(doc);
  });
  return doc;
}

export function reviewPassport(input: {
  documentId: string;
  status: "verified" | "rejected";
  actorId: string;
  rejectionReason?: string | null;
}): StudentKycDocument {
  const stamp = nowIso();
  let updated: StudentKycDocument | null = null;
  writePaymentsDb((db) => {
    const doc = db.kycDocuments.find((d) => d.id === input.documentId);
    if (!doc) throw new Error("Passport document not found");
    doc.status = input.status;
    doc.verifiedAt = input.status === "verified" ? stamp : null;
    doc.verifiedById = input.actorId;
    doc.rejectionReason =
      input.status === "rejected" ? (input.rejectionReason ?? "Rejected by admin") : null;
    doc.updatedAt = stamp;
    updated = doc;
  });
  return updated!;
}
