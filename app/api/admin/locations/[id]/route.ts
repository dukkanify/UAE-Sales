import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  deleteLocation,
  patchLocation,
} from "@/services/locations/location-store";
import type { LocationPatch } from "@/types/domain/location";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as LocationPatch;
  const location = await patchLocation(id, body);

  if (!location) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "location_update",
    targetType: "location",
    targetId: id,
    detail: [
      body.name ? `اسم ${body.name}` : null,
      typeof body.enabled === "boolean"
        ? body.enabled
          ? "مفعّل"
          : "معطّل"
        : null,
      typeof body.sortOrder === "number" ? `ترتيب ${body.sortOrder}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  return NextResponse.json({ location });
}

export async function DELETE(_request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("categories");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const deleted = await deleteLocation(id);

  if (!deleted) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "location_delete",
    targetType: "location",
    targetId: id,
    detail: "حذف موقع",
  });

  return NextResponse.json({ ok: true });
}
