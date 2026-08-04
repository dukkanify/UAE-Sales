import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import {
  listReportHistory,
  listScheduledReports,
  runDueScheduledReports,
  scheduleReport,
} from "@/services/analytics/dashboard-service";
import { analyticsErrorResponse } from "@/app/api/analytics/_utils";
import type { AnalyticsFilters, AnalyticsScope, ReportFrequency } from "@/types/analytics";

export async function GET(request: Request) {
  try {
    ensureAnalyticsSeeded();
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "scheduled";
    if (view === "history") {
      return NextResponse.json({
        success: true,
        data: listReportHistory(80),
        error: null,
      });
    }
    if (view === "run_due") {
      const ran = runDueScheduledReports();
      return NextResponse.json({ success: true, data: { ran }, error: null });
    }
    return NextResponse.json({
      success: true,
      data: listScheduledReports(),
      error: null,
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensureAnalyticsSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      name?: string;
      scope?: AnalyticsScope;
      frequency?: ReportFrequency;
      recipients?: string[];
      filters?: AnalyticsFilters;
    };
    if (!body.name || !body.scope || !body.frequency || !body.recipients?.length) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "name, scope, frequency, and recipients required",
        },
        { status: 400 },
      );
    }
    const row = await scheduleReport({
      user,
      name: body.name,
      scope: body.scope,
      frequency: body.frequency,
      recipients: body.recipients,
      filters: body.filters,
    });
    return NextResponse.json({ success: true, data: row, error: null });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
