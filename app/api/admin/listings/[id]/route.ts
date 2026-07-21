import { NextResponse } from "next/server";
import {
  patchListingRecord,
  toAdminListingRecord,
} from "@/services/listings/listing-store";
import type { AdminListingPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminListingPatch;
  const listing = await patchListingRecord(id, body);

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ listing: toAdminListingRecord(listing) });
}
