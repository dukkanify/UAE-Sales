import { createPayloadCollectionStore } from "@/services/db/durable-json-collection";

export type EscrowEvidenceKind = "photo" | "video" | "document";

export type EscrowEvidenceRecord = {
  id: string;
  orderId: string;
  listingId: string;
  transactionId: string;
  uploaderRole: "seller" | "buyer" | "admin";
  uploadedBy: string;
  kind: EscrowEvidenceKind;
  storageUrl: string;
  mimeType?: string;
  byteSize?: number;
  caption?: string;
  sortOrder: number;
  uploadedAt: string;
};

export type EscrowEvidenceConfirmation = {
  orderId: string;
  buyerId: string;
  confirmed: boolean;
  confirmationAt: string;
  buyerNotes?: string;
};

const evidenceStore = createPayloadCollectionStore<EscrowEvidenceRecord>({
  table: "escrow_evidence",
  fileName: "sooqna-escrow-evidence.json",
});

const confirmStore = createPayloadCollectionStore<
  EscrowEvidenceConfirmation & { id: string }
>({
  table: "escrow_evidence_confirmations",
  fileName: "sooqna-escrow-confirmations.json",
});

const ALLOWED_IMAGE = /^data:image\/(jpeg|jpg|png|webp);base64,/i;
const ALLOWED_VIDEO_URL = /^(https?:\/\/|data:video\/(mp4|webm);base64,)/i;
const MAX_DATA_URL_CHARS = 6_000_000; // ~4.5MB binary

export function validateEvidenceUrl(
  url: string,
  kind: EscrowEvidenceKind,
): { ok: true } | { ok: false; error: string } {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, error: "EMPTY_URL" };
  if (trimmed.length > MAX_DATA_URL_CHARS) {
    return { ok: false, error: "FILE_TOO_LARGE" };
  }
  if (kind === "photo") {
    if (ALLOWED_IMAGE.test(trimmed) || /^https:\/\//i.test(trimmed)) {
      return { ok: true };
    }
    return { ok: false, error: "INVALID_IMAGE_TYPE" };
  }
  if (kind === "video") {
    if (ALLOWED_VIDEO_URL.test(trimmed) || /^https:\/\//i.test(trimmed)) {
      return { ok: true };
    }
    return { ok: false, error: "INVALID_VIDEO_TYPE" };
  }
  if (/^https:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    if (/\.exe($|\?)/i.test(trimmed) || /javascript:/i.test(trimmed)) {
      return { ok: false, error: "EXECUTABLE_NOT_ALLOWED" };
    }
    return { ok: true };
  }
  return { ok: false, error: "INVALID_FILE_TYPE" };
}

export async function listEvidenceForOrder(
  orderId: string,
): Promise<EscrowEvidenceRecord[]> {
  const all = await evidenceStore.listAll();
  return all
    .filter((item) => item.orderId === orderId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.uploadedAt.localeCompare(b.uploadedAt));
}

export async function addEscrowEvidence(input: {
  orderId: string;
  listingId: string;
  transactionId: string;
  uploadedBy: string;
  uploaderRole: EscrowEvidenceRecord["uploaderRole"];
  kind: EscrowEvidenceKind;
  storageUrl: string;
  mimeType?: string;
  byteSize?: number;
  caption?: string;
}): Promise<EscrowEvidenceRecord> {
  const check = validateEvidenceUrl(input.storageUrl, input.kind);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const existing = await listEvidenceForOrder(input.orderId);
  const record: EscrowEvidenceRecord = {
    id: `evd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    listingId: input.listingId,
    transactionId: input.transactionId,
    uploaderRole: input.uploaderRole,
    uploadedBy: input.uploadedBy,
    kind: input.kind,
    storageUrl: input.storageUrl.trim(),
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    caption: input.caption?.trim() || undefined,
    sortOrder: existing.length,
    uploadedAt: new Date().toISOString(),
  };
  await evidenceStore.upsert(record);
  return record;
}

export async function replaceSellerEvidenceSet(input: {
  orderId: string;
  listingId: string;
  transactionId: string;
  uploadedBy: string;
  items: Array<{
    storageUrl: string;
    kind: EscrowEvidenceKind;
    mimeType?: string;
    caption?: string;
  }>;
  note?: string;
}): Promise<EscrowEvidenceRecord[]> {
  if (input.items.length === 0) {
    throw new Error("EVIDENCE_REQUIRED");
  }
  if (input.items.length > 12) {
    throw new Error("TOO_MANY_FILES");
  }

  const all = await evidenceStore.listAll();
  const kept = all.filter(
    (item) =>
      !(item.orderId === input.orderId && item.uploaderRole === "seller"),
  );
  const created: EscrowEvidenceRecord[] = [];
  const now = Date.now();

  input.items.forEach((item, index) => {
    const check = validateEvidenceUrl(item.storageUrl, item.kind);
    if (!check.ok) {
      throw new Error(check.error);
    }
    created.push({
      id: `evd-${now}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: input.orderId,
      listingId: input.listingId,
      transactionId: input.transactionId,
      uploaderRole: "seller",
      uploadedBy: input.uploadedBy,
      kind: item.kind,
      storageUrl: item.storageUrl.trim(),
      mimeType: item.mimeType,
      caption: item.caption?.trim() || input.note,
      sortOrder: index,
      uploadedAt: new Date().toISOString(),
    });
  });

  await evidenceStore.replaceAll([...created, ...kept]);
  return created;
}

export async function saveBuyerEvidenceConfirmation(input: {
  orderId: string;
  buyerId: string;
  confirmed: boolean;
  buyerNotes?: string;
}): Promise<EscrowEvidenceConfirmation> {
  const record: EscrowEvidenceConfirmation & { id: string } = {
    id: `evc-${input.orderId}`,
    orderId: input.orderId,
    buyerId: input.buyerId,
    confirmed: input.confirmed,
    confirmationAt: new Date().toISOString(),
    buyerNotes: input.buyerNotes?.trim() || undefined,
  };
  await confirmStore.upsert(record);
  return record;
}

export async function getBuyerEvidenceConfirmation(
  orderId: string,
): Promise<EscrowEvidenceConfirmation | null> {
  const all = await confirmStore.listAll();
  return all.find((item) => item.orderId === orderId) ?? null;
}
