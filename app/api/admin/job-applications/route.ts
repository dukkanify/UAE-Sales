import { NextResponse } from "next/server";
import { getAllJobApplications } from "@/services/job-applications/job-application-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const applications = await getAllJobApplications();
  return NextResponse.json({ applications });
}
