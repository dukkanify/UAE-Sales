import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, recordRateLimitFailure } from "@/services/auth/rate-limit";
import { hashSecureToken } from "@/services/auth/token.service";

const COMPLETE_ACCOUNT_MAX = 5;
const COMPLETE_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

export const COMPLETE_ACCOUNT_GENERIC_ERROR =
  "تعذر إعداد الحساب حاليًا. حاول مرة أخرى لاحقًا.";

export async function enforceCompleteAccountRateLimit(
  request: Request,
  token: string,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const tokenFingerprint = hashSecureToken(token).slice(0, 16);

  const ipAllowed = await checkRateLimit(`complete-account:ip:${ip}`, {
    maxRequests: COMPLETE_ACCOUNT_MAX,
    windowMs: COMPLETE_ACCOUNT_WINDOW_MS,
  });
  const tokenAllowed = await checkRateLimit(`complete-account:token:${tokenFingerprint}`, {
    maxRequests: COMPLETE_ACCOUNT_MAX,
    windowMs: COMPLETE_ACCOUNT_WINDOW_MS,
  });

  if (!ipAllowed || !tokenAllowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "تم تجاوز عدد المحاولات. يرجى الانتظار 15 دقيقة ثم المحاولة مرة أخرى.",
      },
      { status: 429 },
    );
  }

  return null;
}

export async function recordCompleteAccountFailure(
  request: Request,
  token: string,
): Promise<void> {
  const ip = getClientIp(request);
  const tokenFingerprint = hashSecureToken(token).slice(0, 16);
  await recordRateLimitFailure(`complete-account:ip:${ip}`);
  await recordRateLimitFailure(`complete-account:token:${tokenFingerprint}`);
}
