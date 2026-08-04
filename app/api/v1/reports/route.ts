import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiUser } from "@/lib/api/auth";

export const GET = withApiHandler(async (request) => {
  await requireApiUser(request);
  return ok({
    note: "Report exports available via /api/v1/platform/export and /api/reports/*",
    formats: ["csv", "json", "pdf", "xlsx"],
  });
});
