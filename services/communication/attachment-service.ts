/**
 * Communication attachments — local public/uploads/communication with Supabase readiness.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { isSupabaseConfigured } from "@/config/env";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { uploadFile as uploadToSupabase } from "@/services/storage/storage-service";
import { COMM_ATTACHMENT_MIME_ALLOW } from "@/constants/communication";
import { CommunicationError } from "@/services/communication/access";
import { writeCommunicationDb } from "@/services/communication/store";
import type { AttachmentRef } from "@/types/communication";

function guessExt(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  };
  return map[mime] ?? "";
}

export async function uploadCommunicationAttachment(input: {
  file: File;
  actorId: string;
}): Promise<AttachmentRef> {
  const settings = getPlatformSettings();
  const maxBytes = settings.security.maxUploadSizeMb * 1024 * 1024;
  if (input.file.size > maxBytes) {
    throw new CommunicationError(
      `File exceeds ${settings.security.maxUploadSizeMb}MB limit`,
    );
  }

  const mime = input.file.type || "application/octet-stream";
  if (mime !== "application/octet-stream" && !COMM_ATTACHMENT_MIME_ALLOW.has(mime)) {
    throw new CommunicationError(`File type ${mime} is not allowed`);
  }

  const ext = path.extname(input.file.name) || guessExt(mime);
  const fileName = `comm-${generateId().slice(0, 12)}${ext.toLowerCase()}`;
  const relativePath = `communication/${input.actorId}/${fileName}`;

  let publicUrl: string;

  if (settings.storage.provider === "supabase" && isSupabaseConfigured()) {
    const result = await uploadToSupabase(relativePath, input.file);
    if (!result.success || !result.data) {
      throw new CommunicationError(result.error ?? "Supabase upload failed");
    }
    publicUrl = result.data.publicUrl ?? result.data.path;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads", "communication", input.actorId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await input.file.arrayBuffer());
    writeFileSync(path.join(dir, fileName), buffer);
    publicUrl = `/uploads/communication/${input.actorId}/${fileName}`;
  }

  const attachment: AttachmentRef = {
    id: generateId(),
    fileName: input.file.name,
    mimeType: mime,
    sizeBytes: input.file.size,
    url: publicUrl,
    uploadedById: input.actorId,
    createdAt: new Date().toISOString(),
  };

  writeCommunicationDb((db) => {
    db.attachments.unshift(attachment);
  });

  return attachment;
}
