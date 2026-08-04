import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { getActivityMonitoring } from "@/services/settings/monitoring";

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);
    const data = getActivityMonitoring();
    return NextResponse.json({ success: true, data, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}
