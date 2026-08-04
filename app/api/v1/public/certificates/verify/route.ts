import { withApiHandler } from "@/lib/api/with-handler";
import { ok, ApiError } from "@/lib/api/envelope";
import { requirePublicOrAuth } from "@/lib/api/auth";
import { verifyCertificatePublic } from "@/services/certificates/verification-service";

export const GET = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || url.searchParams.get("number");
  if (!code) throw new ApiError(400, "validation_error", "code or number required");
  return ok(verifyCertificatePublic(code), { meta: { rateLimit: "60/min/ip" } });
});

export const POST = withApiHandler(async (request) => {
  await requirePublicOrAuth(request);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const code = String(body?.code ?? body?.number ?? "");
  if (!code) throw new ApiError(400, "validation_error", "code or number required");
  return ok(verifyCertificatePublic(code));
});
