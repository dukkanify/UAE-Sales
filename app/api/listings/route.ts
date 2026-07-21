import { NextResponse } from "next/server";
import { upsertListing } from "@/services/listings/listing-store";
import type { Listing } from "@/types";

/** Public upsert used by listing create/edit forms to sync site data into the catalog store. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { listing?: Listing };
    if (!body.listing?.id || !body.listing?.title) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const listing = await upsertListing(body.listing);
    return NextResponse.json({ listing }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
