import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/services/auth/session-cookie";
import { isMarketplaceAccountReady } from "@/services/auth/account-access";
import { notifyListingSubmitted } from "@/services/listings/listing-notifications";
import { getListingById, upsertListing } from "@/services/listings/listing-store";
import type { Listing } from "@/types";

/** Authenticated upsert used by listing create/edit forms to sync site data into the catalog store. */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
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
    const listing = await upsertListing({
      ...body.listing,
      seller: {
        ...body.listing.seller,
        id: session.id,
        name: body.listing.seller?.name || session.fullName,
      },
    });

    const isResubmit =
      Boolean(existing) &&
      existing?.status === "rejected" &&
      listing.status === "pending_review";
    if (!existing || isResubmit) {
      void notifyListingSubmitted(listing);
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
