import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { createApiKey, listApiKeys, revokeApiKey } from "@/services/api-platform/api-key-service";
import type { ApiKeyScope } from "@/types/api-platform";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  return ok(listApiKeys());
});

export const POST = withApiHandler(async (request) => {
  const ctx = await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) throw new ApiError(400, "validation_error", "JSON body required");

  if (body.action === "revoke") {
    if (!body.id) throw new ApiError(400, "validation_error", "id required");
    return ok(revokeApiKey(String(body.id)));
  }

  if (!body.name) throw new ApiError(400, "validation_error", "name required");
  const scopes = Array.isArray(body.scopes)
    ? (body.scopes.map(String) as ApiKeyScope[])
    : (["mobile:full"] as ApiKeyScope[]);
  return ok(
    createApiKey({
      name: String(body.name),
      scopes,
      ownerUserId: ctx.user.id,
      rateLimitPerMinute: body.rateLimitPerMinute != null ? Number(body.rateLimitPerMinute) : 120,
      allowedIps: Array.isArray(body.allowedIps) ? body.allowedIps.map(String) : [],
      expiresAt: body.expiresAt != null ? String(body.expiresAt) : null,
    }),
    { status: 201 },
  );
});
