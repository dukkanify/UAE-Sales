import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError, clientIp } from "@/lib/api/envelope";
import { requestOtp } from "@/services/auth/auth-service";

export const POST = withApiHandler(async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.email) throw new ApiError(400, "validation_error", "email required");
  const result = await requestOtp({
    email: String(body.email),
    purpose: (body.purpose as "login" | "register") || "login",
    rememberMe: Boolean(body.rememberMe ?? true),
    ctx: {
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    },
  });
  if (!result.success) {
    throw new ApiError(400, "otp_request_failed", result.error || "OTP request failed");
  }
  return ok({
    email: result.data?.email ?? String(body.email),
    expiresInMinutes: result.data?.expiresInMinutes ?? 10,
    demoHint: result.data?.demoOtp ? "Demo OTP enabled in non-production" : null,
  });
});
