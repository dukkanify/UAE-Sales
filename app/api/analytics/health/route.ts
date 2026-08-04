import { NextResponse } from "next/server";

import { requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { ensureAnalyticsSeeded } from "@/services/analytics/seed";
import { getHealthDashboard } from "@/services/analytics/monitoring-service";
import { analyticsErrorResponse } from "@/app/api/analytics/_utils";

export async function GET() {
  try {
    ensureAnalyticsSeeded();
    await requirePermission(PERMISSIONS.AUDIT_READ);
    return NextResponse.json({
      success: true,
      data: getHealthDashboard(),
      error: null,
    });
  } catch (error) {
    return analyticsErrorResponse(error);
  }
}
