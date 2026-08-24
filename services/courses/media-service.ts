/**
 * Course media storage — local public/uploads/courses with Supabase readiness.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { isSupabaseConfigured } from "@/config/env";
import { logActivity } from "@/services/auth/activity-log";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { uploadFile as uploadToSupabase } from "@/services/storage/storage-service";
import { CourseValidationError } from "@/services/courses/validation";

const COURSE_MIME_ALLOW = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
]);

export type CourseMediaKind = "thumbnail" | "cover" | "video" | "attachment";

export async function uploadCourseMedia(input: {
  file: File;
  kind: CourseMediaKind;
  courseId?: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ path: string; publicUrl: string; mimeType: string; sizeBytes: number; fileName: string }> {
  const settings = getPlatformSettings();
  const maxBytes = settings.security.maxUploadSizeMb * 1024 * 1024;
  if (input.file.size > maxBytes) {
    throw new CourseValidationError(
      `File exceeds ${settings.security.maxUploadSizeMb}MB limit`,
    );
  }

  const mime = input.file.type || "application/octet-stream";
  if (mime && !COURSE_MIME_ALLOW.has(mime) && settings.security.allowedFileTypes.length) {
    // Prefer course allow-list; fall back if empty type from some browsers
    if (mime !== "application/octet-stream") {
      throw new CourseValidationError(`File type ${mime} is not allowed for course media`);
    }
  }

  const ext = path.extname(input.file.name) || guessExt(mime);
  const allowed = settings.storage.allowedExtensions;
  if (allowed.length && ext && !allowed.includes(ext.toLowerCase())) {
    // Still allow common LMS types even if branding allow-list is narrow
    const lmsExt = [
      ".pdf",
      ".ppt",
      ".pptx",
      ".doc",
      ".docx",
      ".zip",
      ".mp4",
      ".webm",
      ".mp3",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".svg",
    ];
    if (!lmsExt.includes(ext.toLowerCase())) {
      throw new CourseValidationError(`Extension ${ext} is not allowed`);
    }
  }

  const fileName = `${input.kind}-${generateId().slice(0, 12)}${ext.toLowerCase()}`;
  const relativePath = input.courseId
    ? `courses/${input.courseId}/${fileName}`
    : `courses/shared/${fileName}`;

  let publicUrl: string;

  if (settings.storage.provider === "supabase" && isSupabaseConfigured()) {
    const result = await uploadToSupabase(relativePath, input.file);
    if (!result.success || !result.data) {
      throw new CourseValidationError(result.error ?? "Supabase upload failed");
    }
    publicUrl = result.data.publicUrl ?? result.data.path;
  } else if (settings.storage.provider === "supabase") {
    throw new CourseValidationError(
      "Supabase Storage is selected but credentials are not configured",
    );
  } else {
    const dir = path.join(
      process.cwd(),
      "public",
      "uploads",
      input.courseId ? path.join("courses", input.courseId) : path.join("courses", "shared"),
    );
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await input.file.arrayBuffer());
    writeFileSync(path.join(dir, fileName), buffer);
    publicUrl = `/uploads/${relativePath}`;
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.MEDIA_UPLOADED,
    entityType: "course_media",
    entityId: input.courseId ?? null,
    metadata: { kind: input.kind, fileName, sizeBytes: input.file.size, mime },
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    path: relativePath,
    publicUrl,
    mimeType: mime,
    sizeBytes: input.file.size,
    fileName: input.file.name,
  };
}

function guessExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
  };
  return map[mime] ?? ".bin";
}
