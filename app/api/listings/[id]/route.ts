import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { deleteListingById, getListingById } from "@/services/listings/listing-store";

type RouteParams = { params: Promise<{ id: string }> };

/** Owner-only delete — used to roll back unpaid featured drafts. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
  }
  if (listing.seller.id !== user.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  // Only unpaid drafts can be auto-removed this way (featured checkout rollback).
  if (listing.status !== "draft") {
    return NextResponse.json({ error: "CANNOT_DELETE" }, { status: 409 });
  }

  const deleted = await deleteListingById(id, user.id);
  if (!deleted) {
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
