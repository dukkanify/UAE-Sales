import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { getAllJobApplications } from "@/services/job-applications/job-application-store";

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }
  const applications = await getAllJobApplications();
  return NextResponse.json({ applications });
}
