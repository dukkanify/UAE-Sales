import { NextResponse } from "next/server";

import { authErrorResponse, requirePermission } from "@/services/auth/guards";
import { PERMISSIONS } from "@/constants/permissions";
import { readAuthDb } from "@/services/auth/store";

export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.AUDIT_READ);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "50");
    const db = readAuthDb();
    const total = db.auditLogs.length;
    const start = (page - 1) * pageSize;
    const data = db.auditLogs.slice(start, start + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        data,
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      error: null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
