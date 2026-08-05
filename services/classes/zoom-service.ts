/**
 * Zoom API service — Server-to-Server OAuth with secure mock fallback.
 * Secrets never leave the server (env only).
 */

import { generateId, generateToken } from "@/lib/security/crypto";
import { getServerEnv } from "@/config/env";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { logActivity } from "@/services/auth/activity-log";
import { readClassesDb, writeClassesDb } from "@/services/classes/store";
import type { LiveClass, MeetingType, ZoomMeetingRecord } from "@/types/classes";

export function isZoomConfigured(): boolean {
  return zoomCredsPresent();
}

function zoomCredsPresent(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(
      env.ZOOM_ACCOUNT_ID?.trim() && env.ZOOM_CLIENT_ID?.trim() && env.ZOOM_CLIENT_SECRET?.trim(),
    );
  } catch {
    return false;
  }
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getZoomAccessToken(): Promise<string | null> {
  if (!zoomCredsPresent()) return null;
  const env = getServerEnv();
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.accessToken;
  }

  const basic = Buffer.from(`${env.ZOOM_CLIENT_ID}:${env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const url = new URL("https://zoom.us/oauth/token");
  url.searchParams.set("grant_type", "account_credentials");
  url.searchParams.set("account_id", env.ZOOM_ACCOUNT_ID!);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) {
    console.error("Zoom OAuth failed", await res.text());
    return null;
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

function mockMeeting(
  liveClass: LiveClass,
  opts: { waitingRoom: boolean; passcode: boolean; meetingType: MeetingType },
): Omit<ZoomMeetingRecord, "id" | "createdAt" | "updatedAt"> {
  const zoomMeetingId = String(Math.floor(100_000_000 + Math.random() * 899_999_999));
  const password = opts.passcode
    ? generateToken(6)
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 8) || "AtplPass1"
    : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    liveClassId: liveClass.id,
    zoomMeetingId,
    zoomUuid: generateId(),
    joinUrl: `${appUrl}/join/${liveClass.id}?mid=${zoomMeetingId}`,
    startUrl: `${appUrl}/join/${liveClass.id}?host=1&mid=${zoomMeetingId}`,
    password,
    hostEmail: getPlatformSettings().zoom.accountEmail || null,
    waitingRoom: opts.waitingRoom,
    passcodeEnabled: opts.passcode,
    coHostEmails: [],
    providerMode: "mock",
    raw: {
      mock: true,
      topic: liveClass.title,
      type: opts.meetingType === "webinar" ? 5 : 2,
      start_time: liveClass.startsAt,
      duration: liveClass.durationMinutes,
    },
  };
}

async function createZoomApiMeeting(
  liveClass: LiveClass,
  opts: { waitingRoom: boolean; passcode: boolean; meetingType: MeetingType },
): Promise<Omit<ZoomMeetingRecord, "id" | "createdAt" | "updatedAt"> | null> {
  const token = await getZoomAccessToken();
  if (!token) return null;

  const settings = getPlatformSettings();
  const user = settings.zoom.accountEmail || "me";
  const body = {
    topic: liveClass.title,
    type: 2,
    start_time: liveClass.startsAt,
    duration: liveClass.durationMinutes,
    timezone: liveClass.timezone,
    agenda: liveClass.description,
    password: opts.passcode ? undefined : "",
    settings: {
      waiting_room: opts.waitingRoom,
      join_before_host: false,
      mute_upon_entry: true,
      host_video: true,
      participant_video: true,
    },
  };

  const endpoint =
    opts.meetingType === "webinar"
      ? `https://api.zoom.us/v2/users/${encodeURIComponent(user)}/webinars`
      : `https://api.zoom.us/v2/users/${encodeURIComponent(user)}/meetings`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("Zoom create meeting failed", await res.text());
    return null;
  }

  const json = (await res.json()) as {
    id: number | string;
    uuid?: string;
    join_url: string;
    start_url: string;
    password?: string;
  };

  return {
    liveClassId: liveClass.id,
    zoomMeetingId: String(json.id),
    zoomUuid: json.uuid ?? null,
    joinUrl: json.join_url,
    startUrl: json.start_url,
    password: json.password ?? "",
    hostEmail: settings.zoom.accountEmail || null,
    waitingRoom: opts.waitingRoom,
    passcodeEnabled: opts.passcode,
    coHostEmails: [],
    providerMode: "zoom",
    raw: json as unknown as Record<string, unknown>,
  };
}

export async function createMeetingForClass(input: {
  liveClass: LiveClass;
  waitingRoom?: boolean;
  passcode?: boolean;
  meetingType?: MeetingType;
  actorId?: string | null;
}): Promise<ZoomMeetingRecord> {
  const settings = getPlatformSettings();
  const waitingRoom = input.waitingRoom ?? settings.zoom.defaultWaitingRoom;
  const passcode = input.passcode ?? settings.zoom.defaultPasscode;
  const meetingType =
    input.meetingType ?? settings.zoom.defaultMeetingType ?? input.liveClass.meetingType;

  let payload =
    settings.zoom.enabled && zoomCredsPresent()
      ? await createZoomApiMeeting(input.liveClass, { waitingRoom, passcode, meetingType })
      : null;

  if (!payload) {
    payload = mockMeeting(input.liveClass, { waitingRoom, passcode, meetingType });
  }

  const now = new Date().toISOString();
  const record: ZoomMeetingRecord = {
    id: generateId(),
    ...payload,
    createdAt: now,
    updatedAt: now,
  };

  writeClassesDb((d) => {
    d.zoomMeetings = d.zoomMeetings.filter((z) => z.liveClassId !== input.liveClass.id);
    d.zoomMeetings.push(record);
    const idx = d.classes.findIndex((c) => c.id === input.liveClass.id);
    if (idx >= 0) {
      const current = d.classes[idx]!;
      d.classes[idx] = {
        ...current,
        zoomMeetingId: record.id,
        updatedAt: now,
      };
    }
  });

  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.ZOOM_MEETING_CREATED,
    entityType: "zoom_meeting",
    entityId: record.id,
    metadata: {
      liveClassId: input.liveClass.id,
      zoomMeetingId: record.zoomMeetingId,
      providerMode: record.providerMode,
    },
  });

  return record;
}

export async function updateMeetingForClass(input: {
  liveClass: LiveClass;
  actorId?: string | null;
}): Promise<ZoomMeetingRecord | null> {
  const existing = readClassesDb().zoomMeetings.find((z) => z.liveClassId === input.liveClass.id);
  if (!existing)
    return createMeetingForClass({ liveClass: input.liveClass, actorId: input.actorId });

  if (existing.providerMode === "zoom" && zoomCredsPresent()) {
    const token = await getZoomAccessToken();
    if (token) {
      await fetch(`https://api.zoom.us/v2/meetings/${existing.zoomMeetingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: input.liveClass.title,
          start_time: input.liveClass.startsAt,
          duration: input.liveClass.durationMinutes,
          timezone: input.liveClass.timezone,
          agenda: input.liveClass.description,
        }),
      }).catch((err) => console.error("Zoom update failed", err));
    }
  }

  const now = new Date().toISOString();
  const next: ZoomMeetingRecord = {
    ...existing,
    updatedAt: now,
    raw: {
      ...existing.raw,
      topic: input.liveClass.title,
      start_time: input.liveClass.startsAt,
      duration: input.liveClass.durationMinutes,
    },
  };
  writeClassesDb((d) => {
    const idx = d.zoomMeetings.findIndex((z) => z.id === existing.id);
    if (idx >= 0) d.zoomMeetings[idx] = next;
  });

  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.ZOOM_MEETING_UPDATED,
    entityType: "zoom_meeting",
    entityId: next.id,
    metadata: { liveClassId: input.liveClass.id },
  });

  return next;
}

export async function cancelMeetingForClass(input: {
  liveClassId: string;
  actorId?: string | null;
}): Promise<void> {
  const existing = readClassesDb().zoomMeetings.find((z) => z.liveClassId === input.liveClassId);
  if (!existing) return;

  if (existing.providerMode === "zoom" && zoomCredsPresent()) {
    const token = await getZoomAccessToken();
    if (token) {
      await fetch(`https://api.zoom.us/v2/meetings/${existing.zoomMeetingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.error("Zoom cancel failed", err));
    }
  }

  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.ZOOM_MEETING_CANCELLED,
    entityType: "zoom_meeting",
    entityId: existing.id,
    metadata: { liveClassId: input.liveClassId, zoomMeetingId: existing.zoomMeetingId },
  });
}

export function getZoomMeetingByClassId(liveClassId: string): ZoomMeetingRecord | null {
  return readClassesDb().zoomMeetings.find((z) => z.liveClassId === liveClassId) ?? null;
}

/** Safe public join info — never includes start_url for non-hosts */
export function getPublicJoinInfo(liveClassId: string, isHost: boolean) {
  const m = getZoomMeetingByClassId(liveClassId);
  if (!m) return null;
  return {
    zoomMeetingId: m.zoomMeetingId,
    joinUrl: m.joinUrl,
    startUrl: isHost ? m.startUrl : null,
    password: m.password,
    waitingRoom: m.waitingRoom,
    providerMode: m.providerMode,
  };
}

export function refreshZoomCredentialsFlag(): boolean {
  return zoomCredsPresent();
}

/**
 * Provision a Zoom (or mock) meeting not tied to a live class —
 * used by 1:1 appointment bookings.
 */
export async function provisionStandaloneZoomMeeting(input: {
  topic: string;
  agenda?: string;
  startsAt: string;
  durationMinutes: number;
  timezone: string;
  mockJoinPath: string;
  waitingRoom?: boolean;
  passcode?: boolean;
  actorId?: string | null;
}): Promise<{
  meetingNumber: string;
  joinUrl: string;
  startUrl: string;
  password: string;
  waitingRoom: boolean;
  providerMode: "mock" | "zoom";
}> {
  const settings = getPlatformSettings();
  const waitingRoom = input.waitingRoom ?? settings.zoom.defaultWaitingRoom;
  const passcode = input.passcode ?? settings.zoom.defaultPasscode;

  const synthetic: LiveClass = {
    id: "standalone",
    title: input.topic,
    description: input.agenda ?? "",
    courseId: null,
    moduleId: null,
    lessonId: null,
    instructorId: "",
    assistantInstructorId: null,
    startsAt: input.startsAt,
    endsAt: new Date(Date.parse(input.startsAt) + input.durationMinutes * 60_000).toISOString(),
    durationMinutes: input.durationMinutes,
    timezone: input.timezone,
    maxStudents: 2,
    meetingType: "meeting",
    status: "scheduled",
    zoomMeetingId: null,
    recurringRuleId: null,
    parentClassId: null,
    cancelledAt: null,
    cancelReason: null,
    rescheduledFromId: null,
    createdById: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  let payload =
    settings.zoom.enabled && zoomCredsPresent()
      ? await createZoomApiMeeting(synthetic, {
          waitingRoom,
          passcode,
          meetingType: "meeting",
        })
      : null;

  if (!payload) {
    const zoomMeetingId = String(Math.floor(100_000_000 + Math.random() * 899_999_999));
    const password = passcode
      ? generateToken(6)
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 8) || "AtplPass1"
      : "";
    payload = {
      liveClassId: "standalone",
      zoomMeetingId,
      zoomUuid: generateId(),
      joinUrl: `https://zoom.us/j/${zoomMeetingId}`,
      startUrl: `https://zoom.us/s/${zoomMeetingId}?zak=mock`,
      password,
      hostEmail: settings.zoom.accountEmail || null,
      waitingRoom,
      passcodeEnabled: passcode,
      coHostEmails: [],
      providerMode: "mock",
      raw: {
        mock: true,
        topic: input.topic,
        standalone: true,
        lobbyPath: input.mockJoinPath,
      },
    };
  } else if (payload.providerMode === "mock") {
    // keep
  }

  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.ZOOM_MEETING_CREATED,
    entityType: "booking_zoom",
    entityId: payload.zoomMeetingId,
    metadata: { topic: input.topic, providerMode: payload.providerMode },
  });

  return {
    meetingNumber: payload.zoomMeetingId,
    joinUrl: payload.joinUrl,
    startUrl: payload.startUrl,
    password: payload.password,
    waitingRoom: payload.waitingRoom,
    providerMode: payload.providerMode,
  };
}

export async function cancelStandaloneZoomMeeting(input: {
  meetingNumber: string;
  providerMode: "mock" | "zoom";
  actorId?: string | null;
}): Promise<void> {
  if (input.providerMode === "zoom" && zoomCredsPresent()) {
    const token = await getZoomAccessToken();
    if (token) {
      await fetch(`https://api.zoom.us/v2/meetings/${input.meetingNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.error("Zoom booking cancel failed", err));
    }
  }
  await logActivity({
    actorId: input.actorId ?? null,
    action: ACTIVITY_ACTIONS.ZOOM_MEETING_CANCELLED,
    entityType: "booking_zoom",
    entityId: input.meetingNumber,
  });
}
