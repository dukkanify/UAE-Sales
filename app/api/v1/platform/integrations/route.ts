import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import {
  listIntegrations,
  listOAuthClients,
  updateIntegration,
} from "@/services/api-platform/integration-service";
import type { IntegrationProvider } from "@/types/api-platform";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "oauth") {
    return ok(listOAuthClients());
  }
  return ok(listIntegrations());
});

export const POST = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.provider) throw new ApiError(400, "validation_error", "provider required");
  return ok(
    updateIntegration(String(body.provider) as IntegrationProvider, {
      enabled: body.enabled != null ? Boolean(body.enabled) : undefined,
      config:
        typeof body.config === "object" && body.config
          ? (body.config as Record<string, unknown>)
          : undefined,
      notes: body.notes != null ? String(body.notes) : undefined,
    }),
  );
});
