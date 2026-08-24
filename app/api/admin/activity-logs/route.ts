import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { listActivityLogs } from "@/services/auth/activity-log";
import { PERMISSIONS } from "@/constants/permissions";
import { parsePagination } from "@/lib/api/envelope";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);

    const url = new URL(request.url);
    const p = parsePagination(url, { pageSize: 25 });
    const action = url.searchParams.get("action") ?? undefined;

    const result = listActivityLogs({
      page: p.page,
      pageSize: p.pageSize,
      action,
    });
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (error) {
    return authErrorResponse(error);
  }
}
