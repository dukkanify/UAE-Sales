import { withApiHandler } from "@/lib/api/with-handler";
import { ok, parsePagination, paginate } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { readAuthDb, toUserProfile } from "@/services/auth/store";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.USERS_MANAGE_ALL);
  const url = new URL(request.url);
  const p = parsePagination(url);
  const users = readAuthDb().users.map(toUserProfile);
  const filtered = p.q
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(p.q!.toLowerCase()) ||
          (u.fullName ?? "").toLowerCase().includes(p.q!.toLowerCase()),
      )
    : users;
  return ok(paginate(filtered, p.page, p.pageSize));
});
