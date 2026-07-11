import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addFavorite,
  getFavoritesForUser,
  syncFavoritesForUser,
} from "@/services/favorites/favorite-store";

const favoriteSchema = z.object({
  userId: z.string().min(1),
  listingId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  price: z.number().min(0),
  imageUrl: z.string().optional(),
});

const syncSchema = z.object({
  userId: z.string().min(1),
  favorites: z.array(
    z.object({
      listingId: z.string().min(1),
      slug: z.string().min(1),
      title: z.string().min(1),
      price: z.number().min(0),
      imageUrl: z.string().optional(),
    }),
  ),
});

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "USER_ID_REQUIRED" }, { status: 400 });
  }
  const favorites = await getFavoritesForUser(userId);
  return NextResponse.json({ favorites });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.sync) {
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const favorites = await syncFavoritesForUser(
      parsed.data.userId,
      parsed.data.favorites,
    );
    return NextResponse.json({ favorites });
  }

  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const favorite = await addFavorite(parsed.data);
  return NextResponse.json({ favorite });
}
