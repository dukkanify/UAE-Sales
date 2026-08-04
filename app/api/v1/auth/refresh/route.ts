import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError, clientIp } from "@/lib/api/envelope";
import { refreshTokenPair } from "@/services/api-platform/token-service";

export const POST = withApiHandler(async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const refreshToken = String(body?.refreshToken ?? "");
  if (!refreshToken) throw new ApiError(400, "validation_error", "refreshToken required");
  const tokens = await refreshTokenPair(refreshToken, {
    userAgent: request.headers.get("user-agent"),
    ipAddress: clientIp(request),
  });
  return ok(tokens);
});
