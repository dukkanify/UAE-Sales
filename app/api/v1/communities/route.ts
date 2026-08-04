import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { listCommunities } from "@/services/communication/community-service";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  return ok(listCommunities(ctx.user));
});
