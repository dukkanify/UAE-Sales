/**
 * API v1 request wrapper — logging, errors, timing.
 */

import type { NextResponse } from "next/server";

import { fail, clientIp } from "@/lib/api/envelope";
import { logApiRequest } from "@/services/api-platform/monitoring-service";
import { ensureApiPlatformSeeded } from "@/services/api-platform/seed";

type RouteHandler = (request: Request) => Promise<NextResponse> | NextResponse;

export function withApiHandler(handler: RouteHandler) {
  return async (request: Request) => {
    ensureApiPlatformSeeded();
    const start = Date.now();
    const url = new URL(request.url);
    try {
      const res = await handler(request);
      logApiRequest({
        method: request.method,
        path: url.pathname,
        status: res.status,
        durationMs: Date.now() - start,
        ipAddress: clientIp(request),
        userAgent: request.headers.get("user-agent"),
      });
      return res;
    } catch (error) {
      const res = fail(error);
      logApiRequest({
        method: request.method,
        path: url.pathname,
        status: res.status,
        durationMs: Date.now() - start,
        ipAddress: clientIp(request),
        userAgent: request.headers.get("user-agent"),
        error: error instanceof Error ? error.message : "error",
      });
      return res;
    }
  };
}
