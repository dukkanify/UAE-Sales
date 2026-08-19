import { NextResponse } from "next/server";
import {
  GENERIC_OTP_SENT_MESSAGE,
  OTP_SEND_FAILED_MESSAGE,
  OTP_VERIFY_MESSAGES,
  RESEND_COOLDOWN_MESSAGE,
} from "@/services/auth/auth-messages";
import { attachOtpDisplayCookie } from "@/services/auth/otp-display-cookie";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";
import { canRevealOtpToClient } from "@/services/otp/otp-config";
import { createOtpRequest, invalidateOtpRecord, maskEmail, verifyOtpCode } from "@/services/otp/otp.service";
import type { OtpPurpose } from "@/types/domain/otp";

export async function enforceRateLimit(request: Request, email: string): Promise<boolean> {
  const ip = getClientIp(request);
  const emailAllowed = await checkRateLimit(`otp:email:${email}`);
  const ipAllowed = await checkRateLimit(`otp:ip:${ip}`);
  return emailAllowed && ipAllowed;
}

export function genericOtpResponse(
  email: string,
  extras?: { emailDelivered?: boolean; otp?: string; revealOtp?: boolean },
) {
  const emailDelivered = extras?.emailDelivered ?? true;
  const revealOtp =
    Boolean(extras?.otp) &&
    canRevealOtpToClient(emailDelivered) &&
    Boolean(extras?.revealOtp || !emailDelivered);
  const response = NextResponse.json({
    ok: true,
    message: emailDelivered
      ? GENERIC_OTP_SENT_MESSAGE
      : OTP_SEND_FAILED_MESSAGE,
    maskedEmail: maskEmail(email),
    email,
    emailDelivered,
    ...(revealOtp ? { otp: extras?.otp } : {}),
  });
  if (revealOtp && extras?.otp) {
    attachOtpDisplayCookie(response, email, extras.otp);
  }
  return response;
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
      {
        error: "RESEND_COOLDOWN",
        message: `${RESEND_COOLDOWN_MESSAGE} (${seconds} ثانية)`,
        retryAfterSeconds: seconds,
      },
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

/** Register verification stays easy even if inbox delivery fails. */
export async function sendRegistrationVerifyOtp(input: {
  email: string;
  fullName: string;
  userId: string;
  accountType: string;
}): Promise<{ delivered: boolean; code: string }> {
  const { record, code } = await createOtpRequest({
    email: input.email,
    purpose: "REGISTER",
    userId: input.userId,
    metadata: {
      fullName: input.fullName,
      accountType: input.accountType,
      userId: input.userId,
    },
  });

  const senders = await import("@/services/email/email.service");
  const delivered = await senders.sendRegistrationOtp({
    email: input.email,
    name: input.fullName,
    otp: code,
  });

  if (!delivered && !canRevealOtpToClient(false)) {
    await invalidateOtpRecord(record.id);
    throw new Error("EMAIL_SEND_FAILED");
  }

  return { delivered, code };
}

export async function sendOtpForPurpose(input: {
  email: string;
  fullName: string;
  purpose: OtpPurpose;
  userId?: string;
  metadata?: Record<string, string>;
}): Promise<{ delivered: boolean; code: string }> {
  const { record, code } = await createOtpRequest({
    email: input.email,
    purpose: input.purpose,
    userId: input.userId,
    metadata: input.metadata,
  });

  const senders = await import("@/services/email/email.service");
  const payload = { email: input.email, name: input.fullName, otp: code };
  let delivered = false;

  switch (input.purpose) {
    case "REGISTER":
      delivered = await senders.sendRegistrationOtp(payload);
      break;
    case "LOGIN":
      delivered = await senders.sendLoginOtp(payload);
      break;
    case "PASSWORD_RESET":
      delivered = await senders.sendPasswordResetOtp(payload);
      break;
    case "SET_PASSWORD":
      delivered = await senders.sendSetPasswordOtp(payload);
      break;
    case "EMAIL_CHANGE":
      delivered = await senders.sendEmailChangeOtp(payload);
      break;
    default:
      delivered = await senders.sendLoginOtp(payload);
  }

  if (!delivered && input.purpose === "REGISTER" && !canRevealOtpToClient(false)) {
    await invalidateOtpRecord(record.id);
    throw new Error("EMAIL_SEND_FAILED");
  }

  if (!delivered && input.purpose !== "REGISTER") {
    await invalidateOtpRecord(record.id);
    throw new Error("EMAIL_SEND_FAILED");
  }

  return { delivered, code };
}

