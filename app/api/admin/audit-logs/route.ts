import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { readAuthDb } from "@/services/auth/store";
import { parsePagination, paginate } from "@/lib/api/envelope";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);
    const p = parsePagination(new URL(request.url), { pageSize: 50 });
    const db = readAuthDb();
    const result = paginate(db.auditLogs, p.page, p.pageSize);

    return NextResponse.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
