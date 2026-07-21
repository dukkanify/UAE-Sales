import { NextResponse } from "next/server";
import { getAdminDisputes } from "@/services/admin/dispute-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }
  return NextResponse.json({ disputes: await getAdminDisputes() });
}
