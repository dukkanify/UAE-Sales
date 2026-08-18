import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  getListingById,
  patchListingRecord,
  toAdminListingRecord,
} from "@/services/listings/listing-store";
import {
  notifyListingApproved,
  notifyListingRejected,
} from "@/services/listings/listing-lifecycle";
import type { AdminListingPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("listings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminListingPatch;
  const previous = await getListingById(id);
  const listing = await patchListingRecord(id, body);

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (body.status && body.status !== previous?.status) {
    if (body.status === "active") {
      await notifyListingApproved(listing);
    } else if (body.status === "rejected") {
      await notifyListingRejected(listing);
    }
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
