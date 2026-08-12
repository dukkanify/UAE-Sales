import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  patchListingRecord,
  toAdminListingRecord,
} from "@/services/listings/listing-store";
import type { AdminListingPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminListingPatch;
  const listing = await patchListingRecord(id, body);

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await logAdminAction({
    actorId: admin.id,
    actorName: admin.fullName,
    action: "listing_update",
    targetType: "listing",
    targetId: id,
    detail: [
      body.status ? `حالة ${body.status}` : null,
      typeof body.isFeatured === "boolean"
        ? body.isFeatured
          ? "تمييز"
          : "إلغاء تمييز"
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });

  return NextResponse.json({ listing: toAdminListingRecord(listing) });
}
