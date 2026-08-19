import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { notifyJobApplicationStatusChanged } from "@/services/notifications/notification-events";
import { updateJobApplicationStatus } from "@/services/job-applications/job-application-store";
import type { JobApplication } from "@/types/domain/job-application";

type RouteParams = { params: Promise<{ id: string }> };

const ALLOWED: JobApplication["status"][] = [
  "submitted",
  "reviewed",
  "viewed",
  "shortlisted",
  "rejected",
  "accepted",
];

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

  if (!body.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const application = await updateJobApplicationStatus(id, body.status);
  if (!application) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  void notifyJobApplicationStatusChanged(application);

  await logAdminAction({
    actorId: body.actorId ?? "admin",
    actorName: body.actorName ?? "Admin",
    action: "job_status",
    targetType: "job_application",
    targetId: id,
    detail: `الحالة → ${body.status}`,
  });

  return NextResponse.json({ application });
}
