import { createHash, randomBytes } from "node:crypto";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { UserProfile } from "@/types";
import { findDemoAccountByIdentifier } from "@/mock/demo-accounts.mock";
import { setSessionCookie } from "@/services/auth/session-cookie";
import {
  sendLoginVerificationEmail,
  sendOtpEmail,
  sendWelcomeEmail,
} from "@/services/email/email.service";
import { createOtpRequest, maskEmail } from "@/services/otp/otp.service";
import type { OtpPurpose } from "@/types/domain/otp";

const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

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

function createResetToken(email: string): string {
  return createHash("sha256")
    .update(`${randomBytes(32).toString("hex")}:${email}:${Date.now()}`)
    .digest("hex");
}

function buildRegisteredUser(
  email: string,
  metadata?: Record<string, string>,
): UserProfile {
  return {
    id: `user-${Date.now()}`,
    fullName: metadata?.fullName ?? "مستخدم سوقنا",
    email,
    phone: metadata?.phone ?? "",
    city: metadata?.city ?? "دبي",
    accountType: (metadata?.accountType as UserProfile["accountType"]) ?? "individual",
    isVerified: true,
    joinedAt: new Date().toISOString().slice(0, 10),
  };
}

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
        const account = findDemoAccountByIdentifier(email);
        await sendLoginVerificationEmail({
          email,
          name: account?.profile.fullName ?? "مستخدم سوقنا",
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
    const account = findDemoAccountByIdentifier(email);
    if (!account) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }
    await setSessionCookie(account.profile);
    return NextResponse.json({ ok: true, user: account.profile });
  }

  if (parsed.data.purpose === "REGISTER") {
    const metadata = result.record.metadata;
    if (!metadata?.fullName) {
      return NextResponse.json({ error: "INVALID" }, { status: 400 });
    }

    const user = buildRegisteredUser(email, metadata);
    await setSessionCookie(user);
    try {
      await sendWelcomeEmail({ email: user.email, name: user.fullName });
    } catch {
      // Welcome email is non-blocking after account activation
    }
    return NextResponse.json({ ok: true, user });
  }

  if (parsed.data.purpose === "PASSWORD_RESET") {
    const resetToken = createResetToken(email);
    const { saveCollection, loadCollection } = await import(
      "@/services/payments/data-store"
    );
    const tokens = await loadCollection<{
      email: string;
      expiresAt: string;
      token: string;
    }>("password-reset-tokens.json");
    const withoutStale = tokens.filter((item) => item.email !== email);
    withoutStale.unshift({
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(),
    });
    await saveCollection("password-reset-tokens.json", withoutStale);
    return NextResponse.json({ ok: true, resetToken, maskedEmail: maskEmail(email) });
  }

  return NextResponse.json({ ok: true, metadata: result.record.metadata });
}
