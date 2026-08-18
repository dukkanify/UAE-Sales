import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import {
  enforceRateLimit,
  genericOtpResponse,
  otpCooldownResponse,
  sendRegistrationVerifyOtp,
} from "@/services/auth/auth-handlers";
import {
  createStandardUser,
  toUserProfile,
} from "@/services/auth/user-store";
import { trackAuthEvent } from "@/services/analytics/auth-events";
import { maskEmail } from "@/shared/utils/mask-email";

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
      await sendRegistrationVerifyOtp({
        email,
        fullName,
        userId: stored.id,
        accountType: parsed.data.accountType,
      });
    } catch (error) {
      const cooldown = otpCooldownResponse(error);
      if (cooldown) return cooldown;
    }

    trackAuthEvent("registration_otp_sent");
    const params = new URLSearchParams({
      email,
      purpose: "REGISTER",
      masked: maskEmail(email),
    });

    return NextResponse.json({
      ok: true,
      needsVerification: true,
      email,
      maskedEmail: maskEmail(email),
      redirectTo: `/verify-email?${params.toString()}`,
      accountProof: stored.passwordHash,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "EMAIL_ALREADY_REGISTERED", message: "هذا البريد مسجّل مسبقًا." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "REGISTER_FAILED" }, { status: 500 });
  }
}
