import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { cacheInvalidate, listCacheMeta } from "@/services/api-platform/cache-service";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  return ok(listCacheMeta());
});

export const POST = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const tag = String(body?.tag ?? body?.key ?? "");
  if (!tag) throw new ApiError(400, "validation_error", "tag or key required");
  cacheInvalidate(tag);
  return ok({ invalidated: tag });
});
