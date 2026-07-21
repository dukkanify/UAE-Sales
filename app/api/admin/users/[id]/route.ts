import { NextResponse } from "next/server";
import {
  toAdminUserRecord,
  updateUserAdmin,
} from "@/services/auth/user-store";
import { getAllListings } from "@/services/listings/listing-store";
import type { AdminUserPatch } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteParams) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as AdminUserPatch;
  const user = await updateUserAdmin(id, body);

  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const listings = await getAllListings();
  const listingsCount = listings.filter((item) => item.seller.id === id).length;

  return NextResponse.json({ user: toAdminUserRecord(user, listingsCount) });
}
