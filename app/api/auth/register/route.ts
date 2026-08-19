import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  otpSendFailedResponse,
  sendRegistrationVerifyOtp,
} from "@/services/auth/auth-handlers";
import { canRevealOtpToClient } from "@/services/otp/otp-config";
import {
  createStandardUser,
  toUserProfile,
} from "@/services/auth/user-store";
import { EMAIL_ALREADY_REGISTERED_MESSAGE } from "@/services/auth/auth-messages";
import { AuthStoreError } from "@/services/auth/user-persistence";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { maskEmail } from "@/shared/utils/mask-email";

function registerOtpResponse(input: {
  email: string;
  emailDelivered: boolean;
  otp?: string;
}) {
  const params = new URLSearchParams({
    email: input.email,
    purpose: "REGISTER",
    masked: maskEmail(input.email),
  });
  const revealOtp = Boolean(input.otp) && canRevealOtpToClient(input.emailDelivered);
  const response = NextResponse.json({
    ok: true,
    needsVerification: true,
    email: input.email,
    maskedEmail: maskEmail(input.email),
    emailDelivered: input.emailDelivered,
    ...(revealOtp ? { otp: input.otp } : {}),
    redirectTo: `/verify-email?${params.toString()}`,
  });
  return response;
}

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  accountType: z.enum(["individual", "company"]).default("individual"),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", message: "أكمل البيانات المطلوبة بشكل صحيح." },
      { status: 400 },
    );
  }

  const password = parsed.data.password.trim();
  const confirmPassword = parsed.data.confirmPassword.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "PASSWORD_MISMATCH", message: "كلمتا المرور غير متطابقتين." },
      { status: 400 },
    );
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json(
      {
        error: "WEAK_PASSWORD",
        message: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع حرف كبير وصغير ورقم.",
      },
      { status: 400 },
    );
  }

  try {
    if (!(await enforceRateLimit(request, email))) {
      return genericOtpResponse(email);
    }

    const stored = await createStandardUser({
      email,
      fullName,
      passwordHash: hashPassword(password),
      accountType: parsed.data.accountType,
    });
    const profile = toUserProfile(stored);
    trackAuthEvent("registration_started", { accountType: profile.accountType });

    try {
      const sent = await sendRegistrationVerifyOtp({
        email,
        fullName,
        userId: stored.id,
        accountType: parsed.data.accountType,
      });
      trackAuthEvent("registration_otp_sent");
      return registerOtpResponse({
        email,
        emailDelivered: sent.delivered,
        otp: sent.code,
      });
    } catch (error) {
      const cooldown = otpCooldownResponse(error);
      if (cooldown) return cooldown;
      if (error instanceof Error && error.message === "EMAIL_SEND_FAILED") {
        trackAuthEvent("registration_failed");
        return otpSendFailedResponse();
      }
      return otpSendFailedResponse();
    }
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_REGISTERED", message: EMAIL_ALREADY_REGISTERED_MESSAGE },
        { status: 409 },
      );
    }
    if (error instanceof AuthStoreError) {
      return NextResponse.json(
        { error: "REGISTER_FAILED", message: "تعذر حفظ الحساب. حاول مرة أخرى." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
