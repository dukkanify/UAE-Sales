/**
 * Unit: account protection sessions & content protection config (CR002).
 */

import { beforeAll, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { readAuthDb, writeAuthDb } from "@/services/auth/store";
import { ROLES } from "@/constants/roles";
import {
  getContentProtectionConfig,
  maxAllowedSessions,
  revokeExcessSessions,
} from "@/services/auth/session-service";
import { describeDeviceFromUserAgent } from "@/lib/security/device-fingerprint";
import { updatePlatformSettings } from "@/services/settings/settings-service";

describe("account protection & DRM (CR002)", () => {
  beforeAll(() => {
    ensureDemoUsersSeeded();
  });

  it("describes devices from user agents", () => {
    expect(describeDeviceFromUserAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/120.0")).toContain(
      "Chrome",
    );
    expect(describeDeviceFromUserAgent("Mozilla/5.0 (Macintosh) Version/17 Safari/605")).toContain(
      "Safari",
    );
  });

  it("defaults student sessions to a single concurrent device", () => {
    expect(maxAllowedSessions(ROLES.STUDENT)).toBe(1);
    expect(maxAllowedSessions(ROLES.SUPER_ADMIN)).toBe(0);
  });

  it("revokes excess sessions when keeping one active", () => {
    const student = readAuthDb().users.find((u) => u.role === ROLES.STUDENT)!;
    const now = new Date().toISOString();
    const future = new Date(Date.now() + 86_400_000).toISOString();

    writeAuthDb((db) => {
      db.sessions = db.sessions.filter((s) => s.userId !== student.id);
      db.sessions.push(
        {
          id: "sess-old-1",
          userId: student.id,
          tokenHash: "h1",
          userAgent: "Chrome",
          ipAddress: "1.1.1.1",
          deviceFingerprint: "fp1",
          deviceLabel: "Chrome on Windows",
          rememberMe: false,
          expiresAt: future,
          revokedAt: null,
          createdAt: now,
          lastActiveAt: now,
        },
        {
          id: "sess-old-2",
          userId: student.id,
          tokenHash: "h2",
          userAgent: "Firefox",
          ipAddress: "2.2.2.2",
          deviceFingerprint: "fp2",
          deviceLabel: "Firefox on macOS",
          rememberMe: false,
          expiresAt: future,
          revokedAt: null,
          createdAt: now,
          lastActiveAt: now,
        },
        {
          id: "sess-new",
          userId: student.id,
          tokenHash: "h3",
          userAgent: "Safari",
          ipAddress: "3.3.3.3",
          deviceFingerprint: "fp3",
          deviceLabel: "Safari on iOS",
          rememberMe: false,
          expiresAt: future,
          revokedAt: null,
          createdAt: now,
          lastActiveAt: now,
        },
      );
    });

    const revoked = revokeExcessSessions({
      userId: student.id,
      keepSessionId: "sess-new",
      keep: 1,
    });
    expect(revoked).toBe(2);

    const active = readAuthDb().sessions.filter((s) => s.userId === student.id && !s.revokedAt);
    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe("sess-new");
  });

  it("builds student watermark protection config from settings", async () => {
    await updatePlatformSettings({
      patch: {
        security: {
          contentWatermarkEnabled: true,
          disableRightClickOnLearning: true,
          blockScreenshotShortcuts: true,
          deterScreenRecording: true,
          videoDownloadProtection: true,
        },
      },
      actorId: null,
    });

    const config = getContentProtectionConfig({
      fullName: "Student One",
      email: "student.one@eagerpilots.com",
    });
    expect(config.watermarkEnabled).toBe(true);
    expect(config.watermarkText).toContain("Student One");
    expect(config.watermarkText).toContain("student.one@eagerpilots.com");
    expect(config.disableRightClick).toBe(true);
    expect(config.videoDownloadProtection).toBe(true);
  });
});
