import {
  isSessionUser,
} from "@/services/auth/require-session";
import { requireAdminPermission } from "@/services/auth/admin-permissions";
import { NextResponse } from "next/server";
import {
  createListingFromAdmin,
  getAdminListingRecords,
  upsertListing,
} from "@/services/listings/listing-store";
import { revalidateCatalogSurfaces } from "@/shared/lib/revalidate-catalog";
import type { AdminListingCreateInput, Listing } from "@/types";

export async function GET() {
  const admin = await requireAdminPermission("listings");
  if (!isSessionUser(admin)) {
    return admin;
  }
  return NextResponse.json(
    { listings: await getAdminListingRecords() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

/**
 * Create a listing from admin form, or import/upsert full listing payloads
 * (including localStorage-created ones).
 */
export async function POST(request: Request) {
  const admin = await requireAdminPermission("listings");
  if (!isSessionUser(admin)) {
    return admin;
  }

  const body = (await request.json()) as {
    create?: AdminListingCreateInput;
    listings?: Listing[];
    listing?: Listing;
  };

  if (body.create) {
    const create = body.create;
    if (!create.title?.trim() || !create.categoryId || !create.city) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    if (!Number.isFinite(create.price) || create.price <= 0) {
      return NextResponse.json({ error: "INVALID_PRICE" }, { status: 400 });
    }

    const listing = await createListingFromAdmin(create);
    await revalidateCatalogSurfaces(listing);
    return NextResponse.json(
      {
        listing: (await getAdminListingRecords()).find(
          (item) => item.id === listing.id,
        ),
        listings: await getAdminListingRecords(),
      },
      { status: 201 },
    );
  }

  const incoming = body.listings ?? (body.listing ? [body.listing] : []);
  if (incoming.length === 0) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const saved = [];
  for (const listing of incoming) {
    if (!listing?.id || !listing?.title) continue;
    saved.push(await upsertListing(listing));
  }

  await revalidateCatalogSurfaces(saved[0]);

  return NextResponse.json({
    imported: saved.length,
    listings: await getAdminListingRecords(),
  });
}
