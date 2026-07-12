import { NextResponse } from "next/server";
import { z } from "zod";
import {
  COMPLETE_ACCOUNT_GENERIC_ERROR,
  enforceCompleteAccountRateLimit,
  recordCompleteAccountFailure,
} from "@/services/auth/complete-account-rate-limit";
import { markGuestConverted } from "@/services/auth/guest-account.service";
import { hashPassword, isStrongPassword } from "@/services/auth/password.service";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { consumeAccountSetupToken } from "@/services/auth/token.service";
import { findUserById, toUserProfile } from "@/services/auth/user-store";
import { markGuestOrdersConverted } from "@/services/payments/order-store";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const rateLimited = await enforceCompleteAccountRateLimit(request, parsed.data.token);
  if (rateLimited) return rateLimited;

  if (parsed.data.password !== parsed.data.confirmPassword) {
    await recordCompleteAccountFailure(request, parsed.data.token);
    return NextResponse.json(
      { error: "SETUP_FAILED", message: COMPLETE_ACCOUNT_GENERIC_ERROR },
      { status: 400 },
    );
  }

  if (!isStrongPassword(parsed.data.password)) {
    await recordCompleteAccountFailure(request, parsed.data.token);
    return NextResponse.json(
      { error: "SETUP_FAILED", message: COMPLETE_ACCOUNT_GENERIC_ERROR },
      { status: 400 },
    );
  }

  const consumed = await consumeAccountSetupToken(parsed.data.token);
  if (!consumed) {
    await recordCompleteAccountFailure(request, parsed.data.token);
    return NextResponse.json(
      { error: "SETUP_FAILED", message: COMPLETE_ACCOUNT_GENERIC_ERROR },
      { status: 400 },
    );
  }

  const user = await findUserById(consumed.userId);
  if (!user) {
    await recordCompleteAccountFailure(request, parsed.data.token);
    return NextResponse.json(
      { error: "SETUP_FAILED", message: COMPLETE_ACCOUNT_GENERIC_ERROR },
      { status: 400 },
    );
  }

  const passwordHash = hashPassword(parsed.data.password);
  const updated = await markGuestConverted(consumed.userId, passwordHash, true);
  if (!updated) {
    await recordCompleteAccountFailure(request, parsed.data.token);
    return NextResponse.json(
      { error: "SETUP_FAILED", message: COMPLETE_ACCOUNT_GENERIC_ERROR },
      { status: 400 },
    );
  }

  await markGuestOrdersConverted(consumed.userId);

  const profile = toUserProfile(updated);
  await setSessionCookie(profile);

  return NextResponse.json({
    ok: true,
    user: profile,
    redirectTo: "/orders",
  });
}
