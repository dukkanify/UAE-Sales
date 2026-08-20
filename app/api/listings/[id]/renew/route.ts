import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import {
  getListingById,
  renewListing,
} from "@/services/listings/listing-store";
import { revalidateCatalogSurfaces } from "@/shared/lib/revalidate-catalog";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
  }

  if (listing.seller.id !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const renewed = await renewListing(id);
  if (!renewed) {
    return NextResponse.json({ error: "RENEW_FAILED" }, { status: 500 });
  }

  await revalidateCatalogSurfaces(renewed);
  return NextResponse.json({ listing: renewed });
}
