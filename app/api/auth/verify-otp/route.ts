import { NextResponse } from "next/server";
import {
  getPostLoginPathForRole,
  verifyOtpCode,
} from "@/lib/repositories/auth.repository";
import {
  createSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { mapDbUser } from "@/lib/mappers";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { ApiHttpError, handleApiRoute } from "@/lib/api/response";
import { parseJsonBody, verifyOtpSchema } from "@/lib/api/validation";
import { isDatabaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  return handleApiRoute(async () => {
    if (!isDatabaseConfigured()) {
      throw new ApiHttpError(
        503,
        "SERVER_ERROR",
        "قاعدة البيانات غير مهيأة.",
      );
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit({
      key: `auth-otp:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rate.allowed) {
      throw new ApiHttpError(
        429,
        "UNKNOWN",
        "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.",
      );
    }

    const body = await parseJsonBody(request, verifyOtpSchema);
    const user = await verifyOtpCode(body.identifier, body.code);

    if (!user) {
      throw new ApiHttpError(401, "UNAUTHORIZED", "رمز التحقق غير صحيح.");
    }

    const { token, expiresAt } = await createSession(user.id);
    const profile = mapDbUser(user, user.wallet?.availableBalance);

    const response = NextResponse.json({
      token,
      user: profile,
      postLoginPath: getPostLoginPathForRole(user.role),
    });

    response.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(expiresAt),
    );

    return response;
  });
}
