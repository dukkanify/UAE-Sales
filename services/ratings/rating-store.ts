import { loadCollection, saveCollection } from "@/services/payments/data-store";
import type { Rating } from "@/types/domain/rating";

const FILE = "ratings.json";

export async function getAllRatings(): Promise<Rating[]> {
  return loadCollection<Rating>(FILE).catch(() => [] as Rating[]);
}

export async function getRatingByOrderId(
  orderId: string,
): Promise<Rating | undefined> {
  const all = await getAllRatings();
  return all.find((item) => item.orderId === orderId);
}

export async function getRatingsForUser(userId: string): Promise<Rating[]> {
  const all = await getAllRatings();
  return all.filter((item) => item.toUserId === userId);
}

/** Alias for seller-facing lookups. */
export async function getRatingsForSeller(sellerId: string): Promise<Rating[]> {
  return getRatingsForUser(sellerId);
}

export async function getAverageForUser(
  userId: string,
): Promise<{ average: number; count: number }> {
  const ratings = await getRatingsForUser(userId);
  if (ratings.length === 0) {
    return { average: 0, count: 0 };
  }
  const sum = ratings.reduce((acc, item) => acc + item.score, 0);
  const average = Math.round((sum / ratings.length) * 10) / 10;
  return { average, count: ratings.length };
}

export type CreateRatingInput = {
  orderId: string;
  listingId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  comment?: string;
};

export async function createRating(input: CreateRatingInput): Promise<Rating> {
  const score = Math.round(input.score);
  if (score < 1 || score > 5) {
    throw new Error("INVALID_SCORE");
  }

  const existing = await getRatingByOrderId(input.orderId);
  if (existing) {
    throw new Error("ALREADY_RATED");
  }

  const all = await getAllRatings();
  const rating: Rating = {
    id: `rating-${Date.now()}`,
    orderId: input.orderId,
    listingId: input.listingId,
    fromUserId: input.fromUserId,
    toUserId: input.toUserId,
    score,
    comment: input.comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  all.unshift(rating);
  await saveCollection(FILE, all);
  return rating;
}
