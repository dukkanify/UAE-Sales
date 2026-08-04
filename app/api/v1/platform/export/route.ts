import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { listExportJobs, startExport } from "@/services/api-platform/import-export-service";
import type { ExportFormat, ImportExportKind } from "@/types/api-platform";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  return ok(listExportJobs());
});

export const POST = withApiHandler(async (request) => {
  const ctx = await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.kind || !body?.format) {
    throw new ApiError(400, "validation_error", "kind and format required");
  }
  return ok(
    startExport({
      kind: String(body.kind) as ImportExportKind | "reports" | "users" | "analytics",
      format: String(body.format) as ExportFormat,
      createdBy: ctx.user.id,
    }),
    { status: 201 },
  );
});
