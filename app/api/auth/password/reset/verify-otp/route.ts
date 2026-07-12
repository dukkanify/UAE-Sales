import { NextResponse } from "next/server";
import { emailOtpDisabledResponse } from "@/services/auth/feature-guard";
import { z } from "zod";
import {
  createResetToken,
  handleOtpVerify,
  storeResetToken,
} from "@/services/auth/auth-handlers";
import { maskEmail } from "@/services/otp/otp.service";

const schema = z.object({
  code: z.string().length(6),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const disabled = emailOtpDisabledResponse();
  if (disabled) return disabled;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const verifyResult = await handleOtpVerify({
    email,
    code: parsed.data.code,
    purpose: "PASSWORD_RESET",
  });

  if (verifyResult instanceof NextResponse) {
    return verifyResult;
  }

  const resetToken = createResetToken(email);
  await storeResetToken(email, resetToken);

  return NextResponse.json({
    ok: true,
    resetToken,
    maskedEmail: maskEmail(email),
  });
}
