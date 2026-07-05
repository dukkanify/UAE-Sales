import {
  createOtpVerification,
  validateUserCredentials,
} from "@/lib/repositories/auth.repository";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { ApiHttpError, handleApiRoute, jsonSuccess } from "@/lib/api/response";
import { loginSchema, parseJsonBody } from "@/lib/api/validation";
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
      key: `auth-login:${ip}`,
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

    const body = await parseJsonBody(request, loginSchema);
    const user = await validateUserCredentials(body.identifier, body.password);

    if (!user) {
      throw new ApiHttpError(
        401,
        "UNAUTHORIZED",
        "بيانات الدخول غير صحيحة.",
      );
    }

    await createOtpVerification(body.identifier, user.id);

    return jsonSuccess({
      identifier: body.identifier,
      otpRequested: true,
    });
  });
}
