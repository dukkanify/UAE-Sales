import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import {
  enqueueJob,
  getQueueStatus,
  listJobs,
  processQueue,
} from "@/services/api-platform/queue-service";
import type { JobType } from "@/types/api-platform";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "status") return ok(getQueueStatus());
  return ok(
    listJobs({
      status: url.searchParams.get("status") ?? "all",
      type: url.searchParams.get("type") ?? "all",
      limit: Number(url.searchParams.get("limit") ?? 100),
    }),
  );
});

export const POST = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = String(body?.action ?? "process");
  if (action === "enqueue") {
    if (!body?.type) throw new ApiError(400, "validation_error", "type required");
    return ok(
      enqueueJob({
        type: String(body.type) as JobType,
        payload:
          typeof body.payload === "object" && body.payload
            ? (body.payload as Record<string, unknown>)
            : {},
      }),
      { status: 201 },
    );
  }
  if (action === "process") {
    return ok(await processQueue(Number(body?.limit ?? 10)));
  }
  throw new ApiError(400, "unknown_action", action);
});
