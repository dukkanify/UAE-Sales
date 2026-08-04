import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { exportReport } from "@/services/analytics/report-service";
import { analyticsErrorResponse, parseFilters } from "@/app/api/analytics/_utils";
import type { AnalyticsScope } from "@/types/analytics";

export async function GET(request: Request) {
  try {
    ensureAnalyticsSeeded();
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const scope = (searchParams.get("scope") ?? "executive") as AnalyticsScope;
    const format = (searchParams.get("format") ?? "csv") as
      | "csv"
      | "pdf"
      | "xlsx"
      | "print";
    const filters = parseFilters(searchParams);
    const exported = exportReport(user, scope, format, filters);

    if (format === "print" || format === "pdf") {
      return new NextResponse(exported.content, {
        status: 200,
        headers: { "Content-Type": exported.contentType },
      });
    }

    return new NextResponse(exported.content, {
      status: 200,
      headers: {
        "Content-Type": exported.contentType,
        "Content-Disposition": `attachment; filename="${exported.filename}"`,
      },
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
