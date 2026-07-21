import { NextResponse } from "next/server";
import { getAllFavorites } from "@/services/favorites/favorite-store";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const favorites = await getAllFavorites();
  const byListing = new Map<string, number>();
  for (const favorite of favorites) {
    byListing.set(
      favorite.listingId,
      (byListing.get(favorite.listingId) ?? 0) + 1,
    );
  }

  return NextResponse.json({
    summary: {
      total: favorites.length,
      uniqueListings: byListing.size,
      uniqueUsers: new Set(favorites.map((item) => item.userId)).size,
    },
    topListings: [...byListing.entries()]
      .map(([listingId, count]) => ({ listingId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    favorites: favorites.slice(0, 100),
  });
}
