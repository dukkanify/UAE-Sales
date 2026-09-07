import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireAdminUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { updateActivityStatus } from "@/services/activity/activity-status-update";
import type { ActivityKind } from "@/types/domain/activity";

const schema = z.object({
  kind: z.enum([
    "job_application",
    "viewing_booking",
    "quote_request",
    "service_booking",
  ]),
  status: z.string().min(1),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    const record = await updateActivityStatus({
      kind: parsed.data.kind as ActivityKind,
      id,
      status: parsed.data.status,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role === "admin" ? "admin" : "seller",
    });
    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "NOT_FOUND" ? 404 : message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) return admin;
  void params;
  return NextResponse.json({ error: "NOT_SUPPORTED" }, { status: 405 });
}
