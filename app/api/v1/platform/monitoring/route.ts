import { withApiHandler } from "@/lib/api/with-handler";
import { ok } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import {
  getApiMonitoringSummary,
  listApiLogs,
} from "@/services/api-platform/monitoring-service";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.AUDIT_READ);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "logs") {
    return ok(listApiLogs(Number(url.searchParams.get("limit") ?? 100)));
  }
  return ok(getApiMonitoringSummary());
});
