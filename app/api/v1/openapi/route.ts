import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { buildOpenApiDocument } from "@/services/api-platform/openapi";

export const GET = withApiHandler(async () => {
  return ok(buildOpenApiDocument(), {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
});
