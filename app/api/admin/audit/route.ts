import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAdminAuditLog } from "@/services/admin/admin-audit-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const entries = await getAdminAuditLog(80);
  return NextResponse.json({ entries });
}
