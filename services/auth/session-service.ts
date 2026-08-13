/**
 * Session listing / revocation for account protection (CR002).
 */

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { describeDeviceFromUserAgent } from "@/lib/security/device-fingerprint";
import { clearSessionCookies, readSessionCookie } from "@/lib/security/cookies";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, writeAuthDb } from "@/services/auth/store";
import { getPlatformSettings } from "@/services/settings/settings-service";
import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import type { ContentProtectionConfig, SessionListItem, SessionRecord } from "@/types";

function nowIso() {
  return new Date().toISOString();
}

export function deviceLockAppliesToRole(role: Role): boolean {
  const security = getPlatformSettings().security;
  if (security.studentOnlyDeviceLock) return role === ROLES.STUDENT;
  return true;
}

export function shouldEnforceSingleDevice(role: Role): boolean {
  const security = getPlatformSettings().security;
  if (!security.singleDeviceLogin && !security.preventAccountSharing) return false;
  if (!deviceLockAppliesToRole(role)) return false;
  const max = security.maxConcurrentSessions;
  return max === 0
    ? Boolean(security.singleDeviceLogin || security.preventAccountSharing)
    : max <= 1;
}

export function maxAllowedSessions(role: Role): number {
  const security = getPlatformSettings().security;
  if (!deviceLockAppliesToRole(role)) return 0; // unlimited for exempt roles
  if (
    !security.singleDeviceLogin &&
    !security.preventAccountSharing &&
    security.maxConcurrentSessions === 0
  ) {
    return 0;
  }
  if (security.singleDeviceLogin || security.preventAccountSharing) {
    return Math.max(1, security.maxConcurrentSessions || 1);
  }
  return security.maxConcurrentSessions;
}

/** Revoke the browser's current session (any user) so account switches cannot leak identity. */
export function revokeSessionById(sessionId: string | null | undefined): boolean {
  if (!sessionId) return false;
  let revoked = false;
  writeAuthDb((db) => {
    const session = db.sessions.find((s) => s.id === sessionId && !s.revokedAt);
    if (session) {
      session.revokedAt = nowIso();
      revoked = true;
    }
  });
  return revoked;
}

/** Revoke older sessions so at most `keep` remain (excluding the new one if passed). */
export function revokeExcessSessions(input: {
  userId: string;
  keepSessionId?: string;
  keep: number;
  actorId?: string | null;
}): number {
  if (input.keep <= 0) return 0;
  let revoked = 0;
  writeAuthDb((db) => {
    const active = db.sessions
      .filter(
        (s) =>
          s.userId === input.userId &&
          !s.revokedAt &&
          new Date(s.expiresAt).getTime() > Date.now() &&
          s.id !== input.keepSessionId,
      )
      .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt));

    // keep-1 others + the new session = keep total
    const allowedOthers = Math.max(0, input.keep - (input.keepSessionId ? 1 : 0));
    const toRevoke = active.slice(allowedOthers);
    const now = nowIso();
    for (const row of toRevoke) {
      const target = db.sessions.find((s) => s.id === row.id);
      if (target && !target.revokedAt) {
        target.revokedAt = now;
        revoked += 1;
      }
    }
  });
  return revoked;
}

export function normalizeSessionRecord(session: SessionRecord): SessionRecord {
  return {
    ...session,
    deviceFingerprint: session.deviceFingerprint ?? null,
    deviceLabel: session.deviceLabel ?? describeDeviceFromUserAgent(session.userAgent) ?? null,
  };
}

export async function listUserSessions(userId: string): Promise<SessionListItem[]> {
  const parsed = await readSessionCookie();
  const currentId = parsed?.payload.sid ?? null;
  const now = Date.now();
  return readAuthDb()
    .sessions.filter(
      (s) => s.userId === userId && !s.revokedAt && new Date(s.expiresAt).getTime() > now,
    )
    .map(normalizeSessionRecord)
    .sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))
    .map((s) => ({
      id: s.id,
      deviceLabel: s.deviceLabel,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      deviceFingerprint: s.deviceFingerprint ? `${s.deviceFingerprint.slice(0, 8)}…` : null,
      rememberMe: s.rememberMe,
      current: s.id === currentId,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
    }));
}

export async function revokeUserSession(input: {
  userId: string;
  sessionId: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ revoked: boolean; signedOut: boolean }> {
  const parsed = await readSessionCookie();
  const isCurrent = parsed?.payload.sid === input.sessionId;
  let revoked = false;

  writeAuthDb((db) => {
    const session = db.sessions.find(
      (s) => s.id === input.sessionId && s.userId === input.userId && !s.revokedAt,
    );
    if (session) {
      session.revokedAt = nowIso();
      revoked = true;
    }
  });

  if (revoked) {
    await logActivity({
      actorId: input.actorId,
      action: ACTIVITY_ACTIONS.SESSION_REVOKED,
      entityType: "session",
      entityId: input.sessionId,
      metadata: { current: isCurrent },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  if (isCurrent) {
    await clearSessionCookies();
  }

  return { revoked, signedOut: isCurrent && revoked };
}

export async function revokeOtherUserSessions(input: {
  userId: string;
  actorId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<number> {
  const parsed = await readSessionCookie();
  const currentId = parsed?.payload.sid ?? null;
  let count = 0;
  writeAuthDb((db) => {
    const now = nowIso();
    for (const session of db.sessions) {
      if (session.userId !== input.userId || session.revokedAt) continue;
      if (session.id === currentId) continue;
      session.revokedAt = now;
      count += 1;
    }
  });
  if (count > 0) {
    await logActivity({
      actorId: input.actorId,
      action: ACTIVITY_ACTIONS.SESSION_REVOKED,
      entityType: "session",
      entityId: null,
      metadata: { revokedOthers: count },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }
  return count;
}

export function getContentProtectionConfig(input: {
  fullName: string | null;
  email: string;
}): ContentProtectionConfig {
  const security = getPlatformSettings().security;
  const label = (input.fullName || "").trim() || input.email;
  return {
    watermarkEnabled: Boolean(security.contentWatermarkEnabled),
    watermarkText: `${label} · ${input.email}`,
    disableRightClick: Boolean(security.disableRightClickOnLearning),
    blockScreenshotShortcuts: Boolean(security.blockScreenshotShortcuts),
    deterScreenRecording: Boolean(security.deterScreenRecording),
    videoDownloadProtection: Boolean(security.videoDownloadProtection),
  };
}
