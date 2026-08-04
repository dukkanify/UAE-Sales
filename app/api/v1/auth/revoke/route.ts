import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { revokeRefreshToken, revokeRefreshFamily } from "@/services/api-platform/token-service";
import { resolveApiAuth } from "@/lib/api/auth";

export const POST = withApiHandler(async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const refreshToken = body?.refreshToken != null ? String(body.refreshToken) : null;
  if (refreshToken) {
    return ok(revokeRefreshToken(refreshToken));
  }
  const ctx = await resolveApiAuth(request);
  if (!ctx.user) throw new ApiError(401, "unauthorized", "Authentication required");
  revokeRefreshFamily(ctx.user.id);
  return ok({ revoked: true, scope: "all_sessions" });
});
