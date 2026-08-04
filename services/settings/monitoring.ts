/**
 * Activity monitoring aggregates for Super Admin.
 */

import { readAuthDb } from "@/services/auth/store";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { existsSync, readdirSync, statSync } from "fs";
import path from "path";

function dirSizeMb(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else total += statSync(p).size;
    }
  };
  try {
    walk(dir);
  } catch {
    return 0;
  }
  return Math.round((total / (1024 * 1024)) * 100) / 100;
}

export function getActivityMonitoring() {
  const db = readAuthDb();
  const settings = getPlatformSettings();
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  const recentLogins = db.activityLogs
    .filter((l) => l.action === ACTIVITY_ACTIONS.LOGIN)
    .slice(0, 10);

  const failedLogins = db.activityLogs.filter(
    (l) =>
      l.action === ACTIVITY_ACTIONS.LOGIN_FAILED &&
      new Date(l.createdAt).getTime() > dayAgo,
  );

  const onlineUsers = db.sessions.filter((s) => {
    if (s.revokedAt) return false;
    if (new Date(s.expiresAt).getTime() < now) return false;
    return new Date(s.lastActiveAt).getTime() > hourAgo;
  });

  const warnings: string[] = [];
  if (settings.general.maintenanceMode) {
    warnings.push("Maintenance mode is enabled");
  }
  if (!settings.email.smtpHost && settings.email.provider === "smtp") {
    warnings.push("SMTP host is not configured");
  }
  if (settings.branding.brandGuidelinesPending) {
    warnings.push("Official brand guidelines are still pending from the client");
  }
  if (failedLogins.length >= 5) {
    warnings.push(`${failedLogins.length} failed login attempts in the last 24 hours`);
  }

  const uploadsMb = dirSizeMb(path.join(process.cwd(), "public", "uploads"));
  const dataMb = dirSizeMb(path.join(process.cwd(), ".data"));

  return {
    recentLogins: recentLogins.map((l) => ({
      id: l.id,
      actorId: l.actorId,
      createdAt: l.createdAt,
      ipAddress: l.ipAddress,
      metadata: l.metadata,
    })),
    onlineUsers: onlineUsers.length,
    onlineSessions: onlineUsers.map((s) => ({
      id: s.id,
      userId: s.userId,
      lastActiveAt: s.lastActiveAt,
      ipAddress: s.ipAddress,
    })),
    failedLoginAttempts24h: failedLogins.length,
    failedLogins: failedLogins.slice(0, 20).map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      ipAddress: l.ipAddress,
      metadata: l.metadata,
    })),
    systemWarnings: warnings,
    databaseStatus: {
      provider: "local-json",
      users: db.users.length,
      sessions: db.sessions.filter((s) => !s.revokedAt).length,
      activityLogs: db.activityLogs.length,
      auditLogs: db.auditLogs.length,
      healthy: true,
    },
    storageUsage: {
      provider: settings.storage.provider,
      uploadsMb,
      dataMb,
      quotaGb: settings.storage.storageQuotaGb,
      percentUsed:
        settings.storage.storageQuotaGb > 0
          ? Math.round(((uploadsMb + dataMb) / (settings.storage.storageQuotaGb * 1024)) * 10000) /
            100
          : 0,
    },
    platformStatus: settings.general.platformStatus,
    generatedAt: new Date().toISOString(),
  };
}
