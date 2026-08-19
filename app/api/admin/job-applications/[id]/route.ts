import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { updateActivityStatus } from "@/services/activity/activity-status-update";
import type { JobApplication } from "@/types/domain/job-application";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await params;
  const body = (await request.json()) as {
    status?: JobApplication["status"];
    actorId?: string;
    actorName?: string;
  };

  if (!body.status) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  try {
    const application = await updateActivityStatus({
      kind: "job_application",
      id,
      status: body.status,
      actorId: body.actorId ?? admin.id,
      actorName: body.actorName ?? admin.fullName,
      actorRole: "admin",
    });
    return NextResponse.json({ application });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "NOT_FOUND" ? 404 : message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
