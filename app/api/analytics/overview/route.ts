import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { listAvailableScopes, resolveScopeAnalytics } from "@/services/analytics/kpi-service";
import { resolveCharts } from "@/services/analytics/chart-service";
import { analyticsErrorResponse, parseFilters } from "@/app/api/analytics/_utils";
import type { AnalyticsScope } from "@/types/analytics";

const SCOPES: AnalyticsScope[] = [
  "executive",
  "learning",
  "instructor",
  "student",
  "financial",
  "course",
  "live",
  "community",
  "support",
  "health",
];

export async function GET(request: Request) {
  try {
    ensureAnalyticsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const scopeParam = (searchParams.get("scope") ?? "executive") as AnalyticsScope;
    const scope = SCOPES.includes(scopeParam) ? scopeParam : "executive";
    const filters = parseFilters(searchParams);
    const view = searchParams.get("view");

    if (view === "scopes") {
      return NextResponse.json({
        success: true,
        data: listAvailableScopes(user),
        error: null,
      });
    }

    if (view === "charts") {
      return NextResponse.json({
        success: true,
        data: resolveCharts(user, scope, filters),
        error: null,
      });
    }

    const snapshot = resolveScopeAnalytics(user, scope, filters);
    return NextResponse.json({
      success: true,
      data: { scope, filters, snapshot },
      error: null,
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
