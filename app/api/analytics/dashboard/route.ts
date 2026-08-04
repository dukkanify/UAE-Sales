import { NextResponse } from "next/server";

import { requireAuth } from "@/services/auth/guards";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import {
  getDashboardPrefs,
  pinSavedReport,
  reorderWidgets,
  saveReport,
  toggleWidgetVisibility,
  updateDashboardPrefs,
  listSavedReports,
} from "@/services/analytics/dashboard-service";
import { analyticsErrorResponse } from "@/app/api/analytics/_utils";
import type { AnalyticsFilters, AnalyticsScope, DashboardWidget } from "@/types/analytics";

export async function GET() {
  try {
    ensureAnalyticsSeeded();
    const user = await requireAuth();
    return NextResponse.json({
      success: true,
      data: {
        prefs: getDashboardPrefs(user),
        savedReports: listSavedReports(user),
      },
      error: null,
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    ensureAnalyticsSeeded();
    const user = await requireAuth();
    const body = (await request.json()) as {
      action?: string;
      widgets?: DashboardWidget[];
      savedFilters?: Array<{ id: string; name: string; filters: AnalyticsFilters }>;
      favoriteDashboardIds?: string[];
      widgetId?: string;
      visible?: boolean;
      orderedIds?: string[];
      reportId?: string;
      pinned?: boolean;
    };

    if (body.action === "toggle_widget" && body.widgetId) {
      return NextResponse.json({
        success: true,
        data: toggleWidgetVisibility(user, body.widgetId, body.visible),
        error: null,
      });
    }
    if (body.action === "reorder" && body.orderedIds) {
      return NextResponse.json({
        success: true,
        data: reorderWidgets(user, body.orderedIds),
        error: null,
      });
    }
    if (body.action === "pin_report" && body.reportId) {
      return NextResponse.json({
        success: true,
        data: pinSavedReport(user, body.reportId, body.pinned ?? true),
        error: null,
      });
    }

    const prefs = updateDashboardPrefs(user, {
      widgets: body.widgets,
      savedFilters: body.savedFilters,
      favoriteDashboardIds: body.favoriteDashboardIds,
    });
    return NextResponse.json({ success: true, data: prefs, error: null });
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
      filters?: AnalyticsFilters;
      pinned?: boolean;
    };
    if (!body.name || !body.scope) {
      return NextResponse.json(
        { success: false, data: null, error: "name and scope required" },
        { status: 400 },
      );
    }
    const report = await saveReport({
      user,
      name: body.name,
      scope: body.scope,
      filters: body.filters ?? {},
      pinned: body.pinned,
    });
    return NextResponse.json({ success: true, data: report, error: null });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
