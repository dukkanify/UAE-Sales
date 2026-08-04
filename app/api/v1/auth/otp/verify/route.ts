import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError, clientIp } from "@/lib/api/envelope";
import { verifyOtp } from "@/services/auth/auth-service";
import { issueTokenPair } from "@/services/api-platform/token-service";
import { dispatchWebhookEvent } from "@/services/api-platform/webhook-service";

export const POST = withApiHandler(async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.email || !body?.token) {
    throw new ApiError(400, "validation_error", "email and token required");
  }
  const purpose = (body.purpose as "login" | "register") || "login";
  const result = await verifyOtp({
    email: String(body.email),
    token: String(body.token),
    purpose,
    ctx: {
      ipAddress: clientIp(request),
      userAgent: request.headers.get("user-agent"),
    },
  });
  if (!result.success || !result.data?.user) {
    throw new ApiError(401, "otp_invalid", result.error || "OTP verification failed");
  }

  const tokens = await issueTokenPair({
    user: result.data.user,
    userAgent: request.headers.get("user-agent"),
    ipAddress: clientIp(request),
  });

  if (purpose === "register") {
    dispatchWebhookEvent("user.registered", {
      userId: result.data.user.id,
      email: result.data.user.email,
      role: result.data.user.role,
    });
  }

  return ok({
    ...tokens,
    requiresProfile: result.data.requiresProfile,
    redirectTo: result.data.redirectTo,
  });
});
