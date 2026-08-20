import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import {
  notifyListingApproved,
  notifyListingRejected,
} from "@/services/listings/listing-notifications";
import {
  getListingById,
  patchListingRecord,
  toAdminListingRecord,
} from "@/services/listings/listing-store";
import { revalidateCatalogSurfaces } from "@/shared/lib/revalidate-catalog";
import type { AdminListingPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("listings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminListingPatch;
  const { rejectReason, ...patch } = body;
  const previous = await getListingById(id);
  const listing = await patchListingRecord(id, patch);

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (body.status && previous && previous.status !== body.status) {
    if (body.status === "active") {
      void notifyListingApproved(listing);
    } else if (body.status === "rejected") {
      void notifyListingRejected(listing, rejectReason);
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

  await revalidateCatalogSurfaces(listing);

  return NextResponse.json({ listing: toAdminListingRecord(listing) });
}
