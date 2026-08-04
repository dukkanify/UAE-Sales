import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { ROLES } from "@/constants/roles";
import { requireAuth } from "@/services/auth/guards";
import { assertPermission } from "@/services/auth/permissions";
import { canManageClass } from "@/services/classes/class-service";
import { listRecordings, registerRecording } from "@/services/classes/recording-service";
import { classErrorResponse } from "@/app/api/classes/_utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (user.role === ROLES.STUDENT) assertPermission(user, PERMISSIONS.ZOOM_CLASSES);
    else if (user.role === ROLES.INSTRUCTOR) assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
    else assertPermission(user, PERMISSIONS.CLASSES_MANAGE);

    let rows = listRecordings(id);
    if (user.role === ROLES.STUDENT) {
      rows = rows.filter((r) => r.studentAccess);
    }
    return NextResponse.json({ success: true, data: rows, error: null });
  } catch (error) {
    return classErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    if (user.role === ROLES.INSTRUCTOR) {
      assertPermission(user, PERMISSIONS.ZOOM_SESSIONS);
      if (!canManageClass(user.id, user.role, id)) {
        return NextResponse.json(
          { success: false, data: null, error: "Forbidden" },
          { status: 403 },
        );
      }
    } else {
      assertPermission(user, PERMISSIONS.CLASSES_MANAGE);
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json(
        { success: false, data: null, error: "JSON body required" },
        { status: 400 },
      );
    }

    const record = await registerRecording({
      liveClassId: id,
      title: String(body.title ?? "Recording"),
      url: String(body.url ?? ""),
      fileType: body.fileType != null ? String(body.fileType) : undefined,
      fileSizeBytes: body.fileSizeBytes != null ? Number(body.fileSizeBytes) : null,
      durationSeconds:
        body.durationSeconds != null ? Number(body.durationSeconds) : null,
      expiresAt: (body.expiresAt as string | null | undefined) ?? null,
      instructorAccess:
        body.instructorAccess != null ? Boolean(body.instructorAccess) : undefined,
      studentAccess: body.studentAccess != null ? Boolean(body.studentAccess) : undefined,
      actorId: user.id,
    });

    return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
  } catch (error) {
    return classErrorResponse(error);
  }
}
