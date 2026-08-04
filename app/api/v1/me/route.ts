import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";
import { getPermissionsForRole } from "@/constants/roles";

export const GET = withApiHandler(async (request) => {
  const ctx = await requireApiUser(request);
  return ok({
    user: ctx.user,
    authType: ctx.authType,
    permissions: getPermissionsForRole(ctx.user.role),
    apiKey: ctx.apiKey
      ? { id: ctx.apiKey.id, name: ctx.apiKey.name, scopes: ctx.apiKey.scopes }
      : null,
  });
});
