import { NextResponse } from "next/server";
import {
  getAdminListingRecords,
  upsertListing,
} from "@/services/listings/listing-store";
import type { Listing } from "@/types";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }
  return NextResponse.json({ listings: await getAdminListingRecords() });
}

/** Import/upsert listings from the site (including localStorage-created ones). */
export async function POST(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const body = (await request.json()) as { listings?: Listing[]; listing?: Listing };
  const incoming = body.listings ?? (body.listing ? [body.listing] : []);
  if (incoming.length === 0) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const saved = [];
  for (const listing of incoming) {
    if (!listing?.id || !listing?.title) continue;
    saved.push(await upsertListing(listing));
  }

  return NextResponse.json({
    imported: saved.length,
    listings: await getAdminListingRecords(),
  });
}
