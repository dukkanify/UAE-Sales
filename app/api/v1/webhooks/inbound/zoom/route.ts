import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { verifyWebhookSignature } from "@/services/api-platform/webhook-service";
import { dispatchWebhookEvent } from "@/services/api-platform/webhook-service";
import { enqueueJob, processQueue } from "@/services/api-platform/queue-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/api/envelope";

/**
 * Inbound Zoom webhook receiver — signature verified when secret configured.
 */
export const POST = withApiHandler(async (request) => {
  const ip = clientIp(request) || "unknown";
  const rl = rateLimit(`inbound-zoom:${ip}`, 120, 60_000);
  if (!rl.allowed) throw new ApiError(429, "rate_limited", "Too many webhook calls");

  const raw = await request.text();
  const timestamp = request.headers.get("x-zm-request-timestamp") || "";
  const signature =
    request.headers.get("x-zm-signature") || request.headers.get("x-aep-signature") || "";
  const secret = process.env.ZOOM_WEBHOOK_SECRET || "";
  const requireSig =
    Boolean(secret) ||
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";

  if (requireSig) {
    if (!secret) {
      throw new ApiError(503, "webhook_misconfigured", "ZOOM_WEBHOOK_SECRET is not configured");
    }
    if (!signature) {
      throw new ApiError(401, "missing_signature", "Webhook signature required");
    }
    const okSig = verifyWebhookSignature(secret, raw, timestamp, signature.replace(/^v0=/, ""));
    if (!okSig) throw new ApiError(401, "invalid_signature", "Webhook signature invalid");
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "invalid_json", "Body must be JSON");
  }

  const event = String(payload.event ?? payload.type ?? "zoom.meeting.started");
  dispatchWebhookEvent(event.startsWith("zoom") ? event : `zoom.${event}`, payload);
  enqueueJob({ type: "webhook", payload: { inbound: "zoom", event } });
  await processQueue(3);

  return ok({ received: true, event });
});
