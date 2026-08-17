import { NextResponse } from "next/server";
import {
  getAverageForUser,
  getRatingsForSeller,
} from "@/services/ratings/rating-store";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const [average, ratings] = await Promise.all([
    getAverageForUser(id),
    getRatingsForSeller(id),
  ]);

  return NextResponse.json({
    average: average.average,
    count: average.count,
    ratings: ratings.slice(0, 20),
  });
}
