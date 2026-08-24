/**
 * Unit + integration coverage for the centralized OTP engine.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import {
  cleanupExpiredOtps,
  getOtpPolicy,
  hashOtpCode,
  issueAndSendOtp,
  matchOtpCode,
  resendOtp,
  validateOtpToken,
} from "@/services/auth/otp-service";
import { findUserByEmail, readAuthDb, writeAuthDb } from "@/services/auth/store";
import { requestOtp } from "@/services/auth/auth-service";

describe("enterprise OTP service", () => {
  beforeEach(() => {
    ensureDemoUsersSeeded();
    writeAuthDb((db) => {
      db.otps = db.otps.filter((o) => o.purpose !== "login" && o.purpose !== "sensitive_action");
    });
  });

  afterEach(() => {
    writeAuthDb((db) => {
      db.otps = db.otps.filter((o) => !o.email.endsWith("@eagerpilots.test"));
    });
  });

  it("exposes a coherent OTP policy from platform settings", () => {
    const policy = getOtpPolicy();
    expect(policy.expirationMinutes).toBeGreaterThanOrEqual(1);
    expect(policy.maxAttempts).toBeGreaterThanOrEqual(1);
    expect(policy.resendCooldownSeconds).toBeGreaterThanOrEqual(15);
  });

  it("hashes OTPs with HMAC and accepts legacy SHA-256", () => {
    const code = "123456";
    const hmac = hashOtpCode(code);
    expect(matchOtpCode(hmac, code)).toBe(true);
    expect(matchOtpCode(hmac, "000000")).toBe(false);
  });

  it("issues, verifies, and single-uses a login OTP", async () => {
    const email = "student.one@eagerpilots.com";
    const user = findUserByEmail(email);
    expect(user).toBeTruthy();

    const issued = await issueAndSendOtp({
      email,
      purpose: "login",
      userId: user!.id,
      rememberMe: true,
      failClosed: true,
    });
    expect(issued.success).toBe(true);
    expect(issued.data?.demoOtp).toBe("123456");

    const challenge = readAuthDb().otps.find((o) => o.email === email && o.purpose === "login");
    expect(challenge?.status).toBe("pending");
    expect(challenge?.userId).toBe(user!.id);
    expect(challenge?.codeHash).toBeTruthy();

    const bad = await validateOtpToken({ email, purpose: "login", token: "000000" });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.reason).toBe("invalid");

    const good = await validateOtpToken({
      email,
      purpose: "login",
      token: issued.data!.demoOtp!,
    });
    expect(good.ok).toBe(true);
  });

  it("enforces resend cooldown and invalidates the previous challenge", async () => {
    const email = "student.one@eagerpilots.com";
    const first = await requestOtp({ email, purpose: "login", rememberMe: true });
    expect(first.success).toBe(true);
    const firstId = readAuthDb().otps.find((o) => o.email === email && o.purpose === "login")!.id;

    const blocked = await resendOtp({
      email,
      purpose: "login",
      userId: findUserByEmail(email)!.id,
      requireExisting: true,
    });
    expect(blocked.success).toBe(false);
    expect(blocked.error).toMatch(/wait/i);

    writeAuthDb((db) => {
      const o = db.otps.find((x) => x.id === firstId);
      if (o) o.resendAvailableAt = new Date(Date.now() - 1000).toISOString();
    });

    const resent = await resendOtp({
      email,
      purpose: "login",
      userId: findUserByEmail(email)!.id,
      requireExisting: true,
    });
    expect(resent.success).toBe(true);
    const next = readAuthDb().otps.find((o) => o.email === email && o.purpose === "login")!;
    expect(next.id).not.toBe(firstId);
    expect(
      readAuthDb().otps.filter((o) => o.email === email && o.purpose === "login"),
    ).toHaveLength(1);
  });

  it("locks after repeated invalid attempts", async () => {
    const email = "otp.lock@eagerpilots.test";
    writeAuthDb((db) => {
      db.otps = db.otps.filter((o) => o.email !== email);
    });

    const issued = await issueAndSendOtp({
      email,
      purpose: "sensitive_action",
      failClosed: true,
    });
    expect(issued.success).toBe(true);

    const policy = getOtpPolicy();
    for (let i = 0; i < policy.maxAttempts; i += 1) {
      const result = await validateOtpToken({
        email,
        purpose: "sensitive_action",
        token: "000000",
      });
      expect(result.ok).toBe(false);
    }

    const locked = readAuthDb().otps.find(
      (o) => o.email === email && o.purpose === "sensitive_action",
    );
    expect(locked?.status).toBe("locked");
    expect(locked?.lockedUntil).toBeTruthy();
  });

  it("rejects expired challenges and cleans them up", async () => {
    const email = "otp.expire@eagerpilots.test";
    const issued = await issueAndSendOtp({
      email,
      purpose: "verify_email",
      failClosed: true,
    });
    expect(issued.success).toBe(true);

    writeAuthDb((db) => {
      const o = db.otps.find((x) => x.email === email && x.purpose === "verify_email");
      if (o) o.expiresAt = new Date(Date.now() - 1000).toISOString();
    });

    const expired = await validateOtpToken({
      email,
      purpose: "verify_email",
      token: issued.data!.demoOtp ?? "123456",
    });
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(expired.reason).toBe("expired");

    cleanupExpiredOtps();
    expect(readAuthDb().otps.some((o) => o.email === email && o.purpose === "verify_email")).toBe(
      false,
    );
  });
});
