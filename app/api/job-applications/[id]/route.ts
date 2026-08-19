import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";
import { notifyJobApplicationStatusChanged } from "@/services/notifications/notification-events";
import {
  getJobApplicationById,
  updateJobApplicationStatus,
} from "@/services/job-applications/job-application-store";
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

const schema = z.object({
  status: z.enum([
    "submitted",
    "reviewed",
    "viewed",
    "shortlisted",
    "rejected",
    "accepted",
  ]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireSessionUser();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !ALLOWED.includes(parsed.data.status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const current = await getJobApplicationById(id);
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isParty =
    session.id === current.employerId ||
    session.id === current.applicantId ||
    session.role === "admin";
  if (!isParty) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const application = await updateJobApplicationStatus(id, parsed.data.status);
  if (!application) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  void notifyJobApplicationStatusChanged(application);
  return NextResponse.json({ application });
}
