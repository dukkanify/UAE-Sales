import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requireApiPermission } from "@/lib/api/auth";
import { PERMISSIONS } from "@/constants/permissions";
import {
  createWebhookEndpoint,
  dispatchWebhookEvent,
  getWebhookEndpointSecret,
  listWebhookDeliveries,
  listWebhookEndpoints,
  updateWebhookEndpoint,
} from "@/services/api-platform/webhook-service";
import type { WebhookEventType } from "@/types/api-platform";
import { processQueue } from "@/services/api-platform/queue-service";

export const GET = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const url = new URL(request.url);
  if (url.searchParams.get("view") === "deliveries") {
    return ok(listWebhookDeliveries(Number(url.searchParams.get("limit") ?? 50)));
  }
  return ok(listWebhookEndpoints());
});

export const POST = withApiHandler(async (request) => {
  await requireApiPermission(request, PERMISSIONS.SYSTEM_SETTINGS);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = String(body?.action ?? "create");

  if (action === "create") {
    if (!body?.url) throw new ApiError(400, "validation_error", "url required");
    return ok(
      createWebhookEndpoint({
        url: String(body.url),
        description: body.description != null ? String(body.description) : undefined,
        events: Array.isArray(body.events)
          ? (body.events.map(String) as WebhookEventType[])
          : ["integration.test"],
      }),
      { status: 201 },
    );
  }
  if (action === "update") {
    return ok(
      updateWebhookEndpoint(String(body?.id), {
        url: body?.url != null ? String(body.url) : undefined,
        description: body?.description != null ? String(body.description) : undefined,
        active: body?.active != null ? Boolean(body.active) : undefined,
        events: Array.isArray(body?.events)
          ? (body!.events.map(String) as WebhookEventType[])
          : undefined,
      }),
    );
  }
  if (action === "reveal_secret") {
    return ok(getWebhookEndpointSecret(String(body?.id)));
  }
  if (action === "test") {
    const queued = dispatchWebhookEvent("integration.test", {
      message: "AviatorPass webhook test",
      at: new Date().toISOString(),
    });
    await processQueue(5);
    return ok(queued);
  }
  if (action === "dispatch") {
    return ok(
      dispatchWebhookEvent(String(body?.eventType ?? "integration.test"), {
        ...(typeof body?.payload === "object" && body.payload
          ? (body.payload as Record<string, unknown>)
          : {}),
      }),
    );
  }
  throw new ApiError(400, "unknown_action", `Unknown action ${action}`);
});
