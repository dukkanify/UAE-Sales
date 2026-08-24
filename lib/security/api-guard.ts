/**
 * API request guards — CSRF, IP blocklist, settings-aware rate limits.
 */

import { NextResponse } from "next/server";

import { requireCsrf, csrfErrorResponse, CsrfError } from "@/lib/security/csrf";
import { rateLimit } from "@/lib/security/rate-limit";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { getRequestContext } from "@/services/auth/guards";

export async function enforceMutatingApiSecurity(request: Request): Promise<NextResponse | null> {
  try {
    const settings = getPlatformSettings();
    const ctx = getRequestContext(request);
    const ip = ctx.ipAddress ?? "unknown";

    if (settings.security.ipBlockingEnabled && settings.security.blockedIps?.includes(ip)) {
      return NextResponse.json(
        { success: false, data: null, error: "Request blocked" },
        { status: 403 },
      );
    }

    if (settings.security.rateLimitingEnabled) {
      const limit = settings.security.rateLimitRequestsPerMinute || 60;
      const result = rateLimit(`api:${ip}`, limit, 60_000);
      if (!result.allowed) {
        return NextResponse.json(
          { success: false, data: null, error: "Rate limit exceeded" },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            },
          },
        );
      }
    }

    await requireCsrf(request);
    return null;
  } catch (error) {
    if (error instanceof CsrfError) return csrfErrorResponse(error);
    return NextResponse.json(
      { success: false, data: null, error: "Security check failed" },
      { status: 400 },
    );
  }
}
