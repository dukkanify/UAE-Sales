import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/services/admin/admin-audit-store";
import { applyAdminListingDecision } from "@/services/listings/listing-review";
import {
  getListingById,
  patchListingRecord,
  toAdminListingRecord,
} from "@/services/listings/listing-store";
import type { AdminListingPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const admin = await requireAdminPermission("listings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminListingPatch;
  const existing = await getListingById(id);
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    let listing = existing;
    if (body.status && body.status !== existing.status) {
      listing = await applyAdminListingDecision(existing, {
        reviewerName: admin.fullName,
        status: body.status,
        rejectionReason: body.rejectionReason,
      });
    }

    if (typeof body.isFeatured === "boolean") {
      listing =
        (await patchListingRecord(id, { isFeatured: body.isFeatured })) ??
        listing;
    }

    await logAdminAction({
      actorId: admin.id,
      actorName: admin.fullName,
      action: "listing_update",
      targetType: "listing",
      targetId: id,
      detail: [
        body.status ? `حالة ${body.status}` : null,
        body.status === "rejected" && body.rejectionReason
          ? `سبب: ${body.rejectionReason.slice(0, 80)}`
          : null,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "REJECT_REASON_REQUIRED" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
