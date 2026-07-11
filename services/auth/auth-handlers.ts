import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import {
  GENERIC_OTP_SENT_MESSAGE,
  OTP_SEND_FAILED_MESSAGE,
  OTP_VERIFY_MESSAGES,
} from "@/services/auth/auth-messages";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";
import { createOtpRequest, maskEmail, verifyOtpCode } from "@/services/otp/otp.service";
import type { OtpPurpose } from "@/types/domain/otp";

export async function enforceRateLimit(request: Request, email: string): Promise<boolean> {
  const ip = getClientIp(request);
  const emailAllowed = await checkRateLimit(`otp:email:${email}`);
  const ipAllowed = await checkRateLimit(`otp:ip:${ip}`);
  return emailAllowed && ipAllowed;
}

export function genericOtpResponse(email: string) {
  return NextResponse.json({
    ok: true,
    message: GENERIC_OTP_SENT_MESSAGE,
    maskedEmail: maskEmail(email),
    email,
  });
}

export function otpSendFailedResponse() {
  return NextResponse.json(
    { error: "EMAIL_SEND_FAILED", message: OTP_SEND_FAILED_MESSAGE },
    { status: 503 },
  );
}

export function otpCooldownResponse(error: unknown) {
  if (error instanceof Error && error.message.startsWith("RESEND_COOLDOWN:")) {
    const seconds = Number(error.message.split(":")[1] ?? 60);
    return NextResponse.json(
      { error: "RESEND_COOLDOWN", retryAfterSeconds: seconds },
      { status: 429 },
    );
  }
  return null;
}

export async function handleOtpVerify(input: {
  email: string;
  code: string;
  purpose: OtpPurpose;
}) {
  const result = await verifyOtpCode(input);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.reason,
        message: OTP_VERIFY_MESSAGES[result.reason],
        attemptsRemaining: result.attemptsRemaining,
      },
      { status: 400 },
    );
  }
  return result;
}

export async function sendOtpForPurpose(input: {
  email: string;
  fullName: string;
  purpose: OtpPurpose;
  userId?: string;
  metadata?: Record<string, string>;
}) {
  const { code } = await createOtpRequest({
    email: input.email,
    purpose: input.purpose,
    userId: input.userId,
    metadata: input.metadata,
  });

  const senders = await import("@/services/email/email.service");
  const payload = { email: input.email, name: input.fullName, otp: code };

  switch (input.purpose) {
    case "REGISTER":
      await senders.sendRegistrationOtp(payload);
      break;
    case "LOGIN":
      await senders.sendLoginOtp(payload);
      break;
    case "PASSWORD_RESET":
      await senders.sendPasswordResetOtp(payload);
      break;
    case "SET_PASSWORD":
      await senders.sendSetPasswordOtp(payload);
      break;
    case "EMAIL_CHANGE":
      await senders.sendEmailChangeOtp(payload);
      break;
    default:
      await senders.sendLoginOtp(payload);
  }
}

export function createResetToken(email: string): string {
  return createHash("sha256")
    .update(`${randomBytes(32).toString("hex")}:${email}:${Date.now()}`)
    .digest("hex");
}

const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

export async function storeResetToken(email: string, token: string) {
  const { saveCollection, loadCollection } = await import("@/services/payments/data-store");
  const tokens = await loadCollection<{
    email: string;
    expiresAt: string;
    token: string;
  }>("password-reset-tokens.json");
  const withoutStale = tokens.filter((item) => item.email !== email);
  withoutStale.unshift({
    email,
    token,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
  });
  await saveCollection("password-reset-tokens.json", withoutStale);
}

export async function consumeResetToken(email: string, token: string): Promise<boolean> {
  const { saveCollection, loadCollection } = await import("@/services/payments/data-store");
  const tokens = await loadCollection<{
    email: string;
    expiresAt: string;
    token: string;
  }>("password-reset-tokens.json");
  const match = tokens.find(
    (item) =>
      item.email === email &&
      item.token === token &&
      new Date(item.expiresAt).getTime() > Date.now(),
  );
  if (!match) return false;
  await saveCollection(
    "password-reset-tokens.json",
    tokens.filter((item) => item.token !== match.token),
  );
  return true;
}
