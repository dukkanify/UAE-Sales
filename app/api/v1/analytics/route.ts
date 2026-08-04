import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { cacheWrap } from "@/services/api-platform/cache-service";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "student";
  const data = cacheWrap(
    `v1:analytics:${ctx.user.id}:${scope}`,
    30,
    ["analytics", ctx.user.id],
    () => ({
      scope,
      userId: ctx.user.id,
      role: ctx.user.role,
      note: "Use /api/analytics/* for full BI; this endpoint is mobile-optimized summary",
      generatedAt: new Date().toISOString(),
    }),
  );
  return ok(data);
});
