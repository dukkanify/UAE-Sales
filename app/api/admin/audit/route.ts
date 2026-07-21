import { NextResponse } from "next/server";
import { getAdminAuditLog } from "@/services/admin/admin-audit-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const entries = await getAdminAuditLog(80);
  return NextResponse.json({ entries });
}
