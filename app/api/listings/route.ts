import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { upsertSellerListing } from "@/services/listings/listing-review";
import type { Listing } from "@/types";

/** Authenticated seller upsert — status is enforced by the review policy. */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  try {
    const body = (await request.json()) as { listing?: Listing };
    if (!body.listing?.id || !body.listing?.title) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const listing = await upsertSellerListing(body.listing, user.id);
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SAVE_FAILED";
    const status = message === "UNAUTHORIZED" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
