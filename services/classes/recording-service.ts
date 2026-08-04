/**
 * Recording architecture — metadata only (no video processing).
 */

import { generateId } from "@/lib/security/crypto";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { createNotification } from "@/services/notifications/notification-service";
import { getLiveClass } from "@/services/classes/class-service";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import { ClassValidationError } from "@/services/classes/validation";
import type { MeetingRecording } from "@/types/classes";

export function listRecordings(liveClassId: string): MeetingRecording[] {
  return readClassesDb().recordings.filter((r) => r.liveClassId === liveClassId);
}

export async function registerRecording(input: {
  liveClassId: string;
  title: string;
  url: string;
  fileType?: string;
  fileSizeBytes?: number | null;
  durationSeconds?: number | null;
  expiresAt?: string | null;
  instructorAccess?: boolean;
  studentAccess?: boolean;
  zoomMeetingId?: string | null;
  metadata?: Record<string, unknown>;
  actorId: string | null;
}): Promise<MeetingRecording> {
  const cls = getLiveClass(input.liveClassId);
  if (!cls) throw new ClassValidationError("Live class not found");
  if (!input.url?.trim()) throw new ClassValidationError("Recording URL is required");

  const now = new Date().toISOString();
  const record: MeetingRecording = {
    id: generateId(),
    liveClassId: input.liveClassId,
    zoomMeetingId: input.zoomMeetingId ?? null,
    title: input.title.trim() || `${cls.title} Recording`,
    url: input.url.trim(),
    fileType: input.fileType ?? "video/mp4",
    fileSizeBytes: input.fileSizeBytes ?? null,
    durationSeconds: input.durationSeconds ?? null,
    availableFrom: now,
    expiresAt: input.expiresAt ?? null,
    instructorAccess: input.instructorAccess ?? true,
    studentAccess: input.studentAccess ?? true,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  };

  writeClassesDb((d) => {
    d.recordings.push(record);
  });

  const participants = readClassesDb().participants.filter(
    (p) => p.liveClassId === input.liveClassId,
  );
  for (const p of participants) {
    if (p.role === "participant" && !record.studentAccess) continue;
    await createNotification({
      userId: p.userId,
      title: "Recording available",
      body: record.title,
      type: "class.recording",
      data: { liveClassId: input.liveClassId, recordingId: record.id },
    });
  }

  await logActivity({
    actorId: input.actorId,
    action: ACTIVITY_ACTIONS.RECORDING_REGISTERED,
    entityType: "meeting_recording",
    entityId: record.id,
    metadata: { liveClassId: input.liveClassId },
  });

  return record;
}
