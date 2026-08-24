/**
 * Enterprise OTP engine — single source of truth for all auth OTP flows.
 *
 * Used by: registration, login, password reset, email verification,
 * change-email, sensitive actions, and future 2FA.
 */

import { getServerEnv } from "@/config/env";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import {
  constantTimeEqual,
  generateId,
  generateOtp,
  hashOtp,
  hashValue,
} from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import type { ApiResponse } from "@/types";
import { sanitizeEmail } from "@/utils/sanitize";
import { logActivity } from "@/services/auth/activity-log";
import { readAuthDb, writeAuthDb, type OtpChallenge } from "@/services/auth/store";
import { sendEmail } from "@/services/email/mailer";
import { otpEmailTemplate } from "@/services/settings/email-templates";
import { getPlatformSettings } from "@/services/settings/settings-service";

export type OtpPurpose = OtpChallenge["purpose"];

export interface OtpPolicy {
  expirationMinutes: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
  maxResends: number;
  lockoutMinutes: number;
}

export interface OtpRequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
}

export interface IssueOtpInput {
  email: string;
  purpose: OtpPurpose;
  userId?: string | null;
  rememberMe?: boolean;
  pendingRegistrationId?: string | null;
  meta?: Record<string, unknown>;
  /** When true, roll back challenge if email delivery fails. Default true for auth. */
  failClosed?: boolean;
  ctx?: OtpRequestContext;
  /** Treat as resend for activity logging / resend counters. */
  isResend?: boolean;
}

export interface IssueOtpResult {
  email: string;
  challengeId: string;
  expiresInMinutes: number;
  resendAvailableInSeconds: number;
  emailDelivery: "smtp" | "outbox" | "failed";
  emailOutboxId?: string;
  demoOtp?: string;
}

export type VerifyOtpFailureReason =
  "missing" | "locked" | "expired" | "invalid" | "max_attempts" | "consumed";

function nowIso(): string {
  return new Date().toISOString();
}

function addMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function addSeconds(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export function getOtpPolicy(): OtpPolicy {
  const env = getServerEnv();
  const auth = getPlatformSettings().authentication;
  return {
    expirationMinutes: Math.max(
      1,
      Number(auth.otpExpirationMinutes) || env.AUTH_OTP_EXPIRY_MINUTES || 10,
    ),
    maxAttempts: Math.max(1, Number(auth.otpMaxAttempts) || 5),
    resendCooldownSeconds: Math.max(15, Number(auth.otpResendCooldownSeconds) || 60),
    maxResends: Math.max(1, Number(auth.otpMaxResends) || 5),
    lockoutMinutes: Math.max(1, Number(auth.otpLockoutMinutes) || 15),
  };
}

export function demoOtpEnabled(): boolean {
  const env = getServerEnv();
  if (!env.ENABLE_DEMO_OTP) return false;
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.FORCE_DEMO_OTP === "true") return true;
  return process.env.NEXT_PUBLIC_APP_ENV !== "production";
}

function otpSecret(): string {
  return getServerEnv().AUTH_SECRET || "aep-dev-auth-secret-change-me";
}

export function hashOtpCode(code: string): string {
  try {
    return hashOtp(code, otpSecret());
  } catch {
    return hashValue(code);
  }
}

/** Match OTP — HMAC preferred; SHA-256 accepted for legacy challenges. */
export function matchOtpCode(codeHash: string, token: string): boolean {
  const hashed = hashOtpCode(token);
  if (constantTimeEqual(hashed, codeHash) || hashed === codeHash) return true;
  return hashValue(token) === codeHash;
}

export function purposeLabel(purpose: OtpPurpose): string {
  switch (purpose) {
    case "register":
      return "create your account";
    case "reset_password":
      return "reset your password";
    case "booking":
      return "confirm your booking";
    case "verify_email":
      return "verify your email";
    case "change_email":
      return "confirm your email change";
    case "two_factor":
      return "complete two-factor authentication";
    case "sensitive_action":
      return "confirm this security action";
    case "login":
    default:
      return "sign in";
  }
}

/** Remove expired / terminal challenges so the store stays lean. */
export function cleanupExpiredOtps(): number {
  const now = Date.now();
  let removed = 0;
  writeAuthDb((db) => {
    const before = db.otps.length;
    db.otps = db.otps.filter((o) => {
      if (o.status === "verified" || o.status === "consumed") return false;
      if (new Date(o.expiresAt).getTime() <= now) {
        removed += 1;
        return false;
      }
      return true;
    });
    removed = Math.max(removed, before - db.otps.length);
  });
  return removed;
}

export function findActiveOtp(email: string, purpose: OtpPurpose): OtpChallenge | null {
  cleanupExpiredOtps();
  const normalized = sanitizeEmail(email);
  const now = Date.now();
  return (
    readAuthDb().otps.find(
      (o) =>
        o.email === normalized &&
        o.purpose === purpose &&
        o.status === "pending" &&
        new Date(o.expiresAt).getTime() > now &&
        !(o.lockedUntil && new Date(o.lockedUntil).getTime() > now),
    ) ?? null
  );
}

export function findOtpChallenge(email: string, purpose: OtpPurpose): OtpChallenge | null {
  cleanupExpiredOtps();
  const normalized = sanitizeEmail(email);
  return readAuthDb().otps.find((o) => o.email === normalized && o.purpose === purpose) ?? null;
}

export async function issueAndSendOtp(input: IssueOtpInput): Promise<ApiResponse<IssueOtpResult>> {
  const email = sanitizeEmail(input.email);
  const purpose = input.purpose;
  const policy = getOtpPolicy();
  const failClosed = input.failClosed !== false;

  const rl = rateLimit(`otp-issue:${email}:${purpose}`, 8, 15 * 60_000);
  if (!rl.allowed) {
    return {
      success: false,
      data: null,
      error: "Too many verification requests. Please try again later.",
    };
  }

  const existing = findOtpChallenge(email, purpose);
  if (existing?.lockedUntil && new Date(existing.lockedUntil).getTime() > Date.now()) {
    return {
      success: false,
      data: null,
      error: "Verification is temporarily locked. Please try again later.",
    };
  }

  // Resend cooldown only — fresh requests may replace the prior challenge
  // (rate limiting still applies). This matches "resend" semantics.
  if (input.isResend && existing) {
    if (existing.resendAvailableAt && new Date(existing.resendAvailableAt).getTime() > Date.now()) {
      const wait = Math.ceil((new Date(existing.resendAvailableAt).getTime() - Date.now()) / 1000);
      return {
        success: false,
        data: null,
        error: `Please wait ${wait}s before requesting a new code.`,
      };
    }
    if ((existing.resendCount ?? 0) >= policy.maxResends) {
      await logActivity({
        actorId: input.userId ?? null,
        action: ACTIVITY_ACTIONS.SECURITY_ALERT,
        entityType: "otp",
        entityId: existing.id,
        metadata: { email, purpose, reason: "max_resends" },
        ...input.ctx,
      });
      return {
        success: false,
        data: null,
        error: "Maximum resend attempts reached. Please start again later.",
      };
    }
  }

  const env = getServerEnv();
  const code = demoOtpEnabled() ? env.DEMO_OTP_CODE : generateOtp(6);
  const priorResends = input.isResend ? (existing?.resendCount ?? 0) + 1 : 0;

  const challenge: OtpChallenge = {
    id: generateId(),
    email,
    userId: input.userId ?? null,
    purpose,
    codeHash: hashOtpCode(code),
    status: "pending",
    attempts: 0,
    maxAttempts: policy.maxAttempts,
    resendCount: priorResends,
    rememberMe: Boolean(input.rememberMe),
    lockedUntil: null,
    resendAvailableAt: addSeconds(policy.resendCooldownSeconds),
    pendingRegistrationId: input.pendingRegistrationId ?? null,
    meta: input.meta ?? {},
    ipAddress: input.ctx?.ipAddress ?? null,
    userAgent: input.ctx?.userAgent ?? null,
    deviceFingerprint: input.ctx?.deviceFingerprint ?? null,
    deviceLabel: input.ctx?.deviceLabel ?? null,
    expiresAt: addMinutes(policy.expirationMinutes),
    verifiedAt: null,
    createdAt: nowIso(),
  };

  writeAuthDb((db) => {
    db.otps = db.otps.filter((o) => !(o.email === email && o.purpose === purpose));
    db.otps.push(challenge);
  });

  await logActivity({
    actorId: input.userId ?? null,
    action: ACTIVITY_ACTIONS.OTP_GENERATED,
    entityType: "otp",
    entityId: challenge.id,
    metadata: { email, purpose, isResend: Boolean(input.isResend) },
    ...input.ctx,
  });

  const template = otpEmailTemplate(code, purposeLabel(purpose), {
    expiresInMinutes: policy.expirationMinutes,
  });
  const mail = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    meta: { kind: "otp", purpose, system: true, challengeId: challenge.id },
  });

  if (mail.mode === "failed") {
    if (failClosed) {
      writeAuthDb((db) => {
        db.otps = db.otps.filter((o) => o.id !== challenge.id);
      });
    }
    return {
      success: false,
      data: null,
      error: "We could not send the verification email. Please try again in a moment.",
    };
  }

  await logActivity({
    actorId: input.userId ?? null,
    action: input.isResend ? ACTIVITY_ACTIONS.OTP_RESENT : ACTIVITY_ACTIONS.OTP_SENT,
    entityType: "otp",
    entityId: challenge.id,
    metadata: { email, purpose, emailMode: mail.mode },
    ...input.ctx,
  });

  return {
    success: true,
    data: {
      email,
      challengeId: challenge.id,
      expiresInMinutes: policy.expirationMinutes,
      resendAvailableInSeconds: policy.resendCooldownSeconds,
      emailDelivery: mail.mode,
      emailOutboxId: mail.outboxId,
      ...(demoOtpEnabled() ? { demoOtp: code } : {}),
    },
    error: null,
  };
}

export async function resendOtp(
  input: Omit<IssueOtpInput, "isResend"> & { requireExisting?: boolean },
): Promise<ApiResponse<IssueOtpResult>> {
  const email = sanitizeEmail(input.email);
  const existing = findOtpChallenge(email, input.purpose);
  if (input.requireExisting !== false && !existing) {
    return {
      success: false,
      data: null,
      error: "No active verification code. Please request a new one from the start.",
    };
  }
  return issueAndSendOtp({
    ...input,
    userId: input.userId ?? existing?.userId ?? null,
    rememberMe: input.rememberMe ?? existing?.rememberMe,
    pendingRegistrationId: input.pendingRegistrationId ?? existing?.pendingRegistrationId ?? null,
    meta: input.meta ?? existing?.meta ?? {},
    isResend: true,
  });
}

export function markOtpVerified(challengeId: string): void {
  writeAuthDb((db) => {
    const o = db.otps.find((x) => x.id === challengeId);
    if (o) {
      o.status = "verified";
      o.verifiedAt = nowIso();
    }
  });
}

export function consumeOtp(challengeId: string): void {
  writeAuthDb((db) => {
    db.otps = db.otps.filter((o) => o.id !== challengeId);
  });
}

export function invalidatePurposeOtps(email: string, purpose: OtpPurpose): void {
  const normalized = sanitizeEmail(email);
  writeAuthDb((db) => {
    db.otps = db.otps.filter((o) => !(o.email === normalized && o.purpose === purpose));
  });
}

/**
 * Validate an OTP token without running purpose-specific side effects.
 * On success the challenge remains until the caller consumes/replaces it.
 */
export async function validateOtpToken(input: {
  email: string;
  purpose: OtpPurpose;
  token: string;
  ctx?: OtpRequestContext;
}): Promise<
  | { ok: true; challenge: OtpChallenge }
  | { ok: false; error: string; reason: VerifyOtpFailureReason; challenge: OtpChallenge | null }
> {
  const email = sanitizeEmail(input.email);
  const token = input.token.trim();
  const policy = getOtpPolicy();

  const rl = rateLimit(`otp-verify:${email}:${input.purpose}`, 12, 15 * 60_000);
  if (!rl.allowed) {
    return {
      ok: false,
      error: "Too many verification attempts. Please try again later.",
      reason: "max_attempts",
      challenge: null,
    };
  }

  // Do not purge before lookup — expired challenges must return an "expired" reason.
  const challenge = readAuthDb().otps.find((o) => o.email === email && o.purpose === input.purpose);

  if (!challenge) {
    return {
      ok: false,
      error: "No active verification code. Request a new one.",
      reason: "missing",
      challenge: null,
    };
  }

  if (challenge.status === "verified" || challenge.status === "consumed") {
    return {
      ok: false,
      error: "This verification code was already used. Request a new one.",
      reason: "consumed",
      challenge,
    };
  }

  if (challenge.lockedUntil && new Date(challenge.lockedUntil).getTime() > Date.now()) {
    return {
      ok: false,
      error: "Too many invalid attempts. Request a new code after the lockout period.",
      reason: "locked",
      challenge,
    };
  }

  if (new Date(challenge.expiresAt).getTime() <= Date.now() || challenge.status === "expired") {
    writeAuthDb((d) => {
      d.otps = d.otps.filter((o) => o.id !== challenge.id);
    });
    await logActivity({
      actorId: challenge.userId,
      action: ACTIVITY_ACTIONS.OTP_EXPIRED,
      entityType: "otp",
      entityId: challenge.id,
      metadata: { email, purpose: input.purpose },
      ...input.ctx,
    });
    return {
      ok: false,
      error: "Verification code has expired. Request a new one.",
      reason: "expired",
      challenge: null,
    };
  }

  const maxAttempts = challenge.maxAttempts || policy.maxAttempts;
  if (challenge.attempts >= maxAttempts) {
    writeAuthDb((d) => {
      const o = d.otps.find((x) => x.id === challenge.id);
      if (o) {
        o.status = "locked";
        o.lockedUntil = addMinutes(policy.lockoutMinutes);
      }
    });
    await logActivity({
      actorId: challenge.userId,
      action: ACTIVITY_ACTIONS.OTP_LOCKED,
      entityType: "otp",
      entityId: challenge.id,
      metadata: { email, purpose: input.purpose },
      ...input.ctx,
    });
    return {
      ok: false,
      error: "Too many attempts. Please try again later.",
      reason: "max_attempts",
      challenge,
    };
  }

  if (!matchOtpCode(challenge.codeHash, token)) {
    let locked = false;
    writeAuthDb((d) => {
      const o = d.otps.find((x) => x.id === challenge.id);
      if (!o) return;
      o.attempts += 1;
      if (o.attempts >= maxAttempts) {
        o.status = "locked";
        o.lockedUntil = addMinutes(policy.lockoutMinutes);
        locked = true;
      }
    });
    await logActivity({
      actorId: challenge.userId,
      action: locked ? ACTIVITY_ACTIONS.OTP_LOCKED : ACTIVITY_ACTIONS.OTP_FAILED,
      entityType: "otp",
      entityId: challenge.id,
      metadata: {
        email,
        purpose: input.purpose,
        reason: locked ? "max_attempts" : "invalid_code",
      },
      ...input.ctx,
    });
    if (locked) {
      await logActivity({
        actorId: challenge.userId,
        action: ACTIVITY_ACTIONS.SECURITY_ALERT,
        entityType: "otp",
        entityId: challenge.id,
        metadata: { email, purpose: input.purpose, alert: "otp_lockout" },
        ...input.ctx,
      });
      return {
        ok: false,
        error: "Too many attempts. Please try again later.",
        reason: "max_attempts",
        challenge,
      };
    }
    return {
      ok: false,
      error: "Invalid verification code.",
      reason: "invalid",
      challenge,
    };
  }

  return { ok: true, challenge };
}
