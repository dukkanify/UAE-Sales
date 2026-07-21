import { NextResponse } from "next/server";
import {
  getAllUsers,
  toAdminUserRecord,
} from "@/services/auth/user-store";
import { getAllListings } from "@/services/listings/listing-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const [users, listings] = await Promise.all([getAllUsers(), getAllListings()]);
  const listingCounts = new Map<string, number>();
  for (const listing of listings) {
    listingCounts.set(
      listing.seller.id,
      (listingCounts.get(listing.seller.id) ?? 0) + 1,
    );
  }

  return NextResponse.json({
    users: users.map((user) =>
      toAdminUserRecord(user, listingCounts.get(user.id) ?? 0),
    ),
  });
}
