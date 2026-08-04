import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import { listImportJobs, startImport } from "@/services/api-platform/import-export-service";
import type { ImportExportKind } from "@/types/api-platform";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  return ok(listImportJobs());
});

export const POST = withApiHandler(async (request) => {
  const ctx = await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.kind) throw new ApiError(400, "validation_error", "kind required");
  const rows = Array.isArray(body.rows) ? (body.rows as Array<Record<string, unknown>>) : [];
  return ok(
    startImport({
      kind: String(body.kind) as ImportExportKind,
      filename: String(body.filename ?? "import.json"),
      rows,
      createdBy: ctx.user.id,
    }),
    { status: 201 },
  );
});
