import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { listActivityLogs } from "@/services/auth/activity-log";
import { PERMISSIONS } from "@/constants/permissions";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const action = searchParams.get("action") ?? undefined;

    const result = listActivityLogs({ page, action });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}
