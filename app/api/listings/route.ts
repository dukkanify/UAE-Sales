import { NextResponse } from "next/server";
import {
  getValidSessionUser,
} from "@/services/auth/require-session";
import { isMarketplaceAccountReady } from "@/services/auth/account-access";
import { notifyListingSubmitted } from "@/services/listings/listing-notifications";
import { getListingById, upsertListing } from "@/services/listings/listing-store";
import type { Listing } from "@/types";

/** Authenticated upsert used by listing create/edit forms to sync site data into the catalog store. */
export async function POST(request: Request) {
  try {
    const session = await getValidSessionUser();
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (!isMarketplaceAccountReady(session)) {
      return NextResponse.json(
        {
          error: "ACCOUNT_NOT_READY",
          message: "أكمل التحقق من الشخص واعتماد الحساب قبل إضافة إعلان.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { listing?: Listing };
    if (!body.listing?.id || !body.listing?.title) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const existing = await getListingById(body.listing.id);
    // Free listings always enter moderation; draft reserved for unpaid featured.
    const requestedStatus = body.listing.status;
    const safeStatus =
      requestedStatus === "draft"
        ? "draft"
        : requestedStatus === "active" && existing?.status === "active"
          ? "active"
          : "pending_review";

    const listing = await upsertListing({
      ...body.listing,
      status: safeStatus,
      seller: {
        ...body.listing.seller,
        id: session.id,
        name: body.listing.seller?.name || session.fullName,
      },
    });

    if (!existing && listing.status === "pending_review") {
      void notifyListingSubmitted(listing);
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
