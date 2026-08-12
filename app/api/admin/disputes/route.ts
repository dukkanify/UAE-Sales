import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAdminDisputes } from "@/services/admin/dispute-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  return NextResponse.json({ disputes: await getAdminDisputes() });
}
