import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { getAdminDisputes } from "@/services/admin/dispute-store";

export async function GET() {
  const admin = await requireAdminPermission("disputes");
  if (!isSessionUser(admin)) {
    return admin;
  }
  return NextResponse.json({ disputes: await getAdminDisputes() });
}
