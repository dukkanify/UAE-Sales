import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/services/auth/session-cookie";
import {
  sendLoginVerificationEmail,
  sendOtpEmail,
} from "@/services/email/email.service";
import { completePersonVerification } from "@/services/auth/signup-approval";
import { issuePasswordResetToken } from "@/services/auth/password-reset-token";
import { emailPasswordResetLink } from "@/services/email/notification-emails";
import { findUserByEmail, getRedirectAfterAuth, toUserProfile } from "@/services/auth/user-store";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";
import type { OtpPurpose } from "@/types/domain/otp";

const verifySchema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
  purpose: z.enum(["REGISTER", "LOGIN", "PASSWORD_RESET", "EMAIL_CHANGE"]),
});

const resendSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["REGISTER", "LOGIN", "PASSWORD_RESET", "EMAIL_CHANGE"]),
  fullName: z.string().optional(),
});


export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "resend") {
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;
    try {
      const email = parsed.data.email.trim().toLowerCase();
      const { code } = await createOtpRequest({
        email,
        purpose: parsed.data.purpose as OtpPurpose,
      });

      if (parsed.data.purpose === "LOGIN") {
        const stored = await findUserByEmail(email);
        await sendLoginVerificationEmail({
          email,
          name: stored?.fullName ?? "مستخدم سوقنا",
          otp: code,
        });
      } else {
        await sendOtpEmail({
          email,
          name: parsed.data.fullName ?? "مستخدم سوقنا",
          otp: code,
        });
      }

      return NextResponse.json({ ok: true, maskedEmail: maskEmail(email) });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("RESEND_COOLDOWN:")) {
        const seconds = Number(error.message.split(":")[1] ?? 60);
        return NextResponse.json(
          { error: "RESEND_COOLDOWN", retryAfterSeconds: seconds },
          { status: 429 },
        );
      }
      return NextResponse.json({ error: "RESEND_FAILED" }, { status: 500 });
    }
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { verifyOtpCode } = await import("@/services/otp/otp.service");
  const email = parsed.data.email.trim().toLowerCase();
  const result = await verifyOtpCode({
    email,
    purpose: parsed.data.purpose as OtpPurpose,
    code: parsed.data.code,
  });

  if (!result.ok) {
    const messages = {
      INVALID: "رمز التحقق غير صحيح.",
      EXPIRED: "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.",
      MAX_ATTEMPTS: "تجاوزت الحد المسموح من المحاولات. اطلب رمزًا جديدًا.",
      NOT_FOUND: "لم يتم العثور على طلب تحقق نشط.",
    };
    return NextResponse.json(
      { error: result.reason, message: messages[result.reason] },
      { status: 400 },
    );
  }

  if (parsed.data.purpose === "LOGIN") {
    const stored = await findUserByEmail(email);
    if (!stored) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }
    const user = toUserProfile(stored);
    await setSessionCookie(user);
    return NextResponse.json({
      ok: true,
      user,
      redirectTo: getRedirectAfterAuth(user),
    });
  }

  if (parsed.data.purpose === "REGISTER") {
    const stored = await findUserByEmail(email);
    if (!stored) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }

    const { approved, user } = await completePersonVerification(stored.id);
    await setSessionCookie(user);
    return NextResponse.json({
      ok: true,
      approved,
      user,
      redirectTo: approved ? getRedirectAfterAuth(user) : "/register/pending",
    });
  }

  if (parsed.data.purpose === "PASSWORD_RESET") {
    const stored = await findUserByEmail(email);
    if (stored?.passwordHash) {
      const rawToken = await issuePasswordResetToken({
        email: stored.email,
        userId: stored.id,
      });
      void emailPasswordResetLink({
        email: stored.email,
        name: stored.fullName,
        token: rawToken,
      }).catch((error) => {
        console.error("[Sooqna Email] password reset link failed", error);
      });
    }
    return NextResponse.json({ ok: true, maskedEmail: maskEmail(email), redirectTo: "/login" });
  }

  return NextResponse.json({ ok: true, metadata: result.record.metadata });
}
