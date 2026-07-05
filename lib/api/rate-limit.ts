import { checkRateLimit, getClientIp, type RateLimitConfig } from "@/lib/auth/rate-limit";
import { ApiHttpError } from "@/lib/api/response";

export async function enforceApiRateLimit(
  request: Request,
  config: Omit<RateLimitConfig, "key"> & { scope: string; identifier?: string },
): Promise<void> {
  const ip = getClientIp(request);
  const key = `${config.scope}:${config.identifier ?? ip}`;
  const result = await checkRateLimit({
    key,
    limit: config.limit,
    windowMs: config.windowMs,
  });

  if (!result.allowed) {
    throw new ApiHttpError(
      429,
      "RATE_LIMITED",
      "محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.",
    );
  }
}
