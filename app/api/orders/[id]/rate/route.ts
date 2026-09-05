import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { getOrderById } from "@/services/payments/order-store";
import {
  createRating,
  getAverageForUser,
  getRatingByOrderId,
} from "@/services/ratings/rating-store";
import { updateSellerListingRating } from "@/services/listings/listing-store";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  if (order.buyerId !== user.id && order.sellerId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const rating = await getRatingByOrderId(id);
  return NextResponse.json({
    rating: rating ?? null,
    canRate:
      order.status === "released" &&
      order.buyerId === user.id &&
      !rating,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  if (order.buyerId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (order.status !== "released") {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 409 });
  }

  let body: { score?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const score = typeof body.score === "number" ? body.score : Number(body.score);
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "INVALID_SCORE" }, { status: 400 });
  }

  const comment =
    typeof body.comment === "string" ? body.comment.trim() : undefined;

  try {
    const rating = await createRating({
      orderId: order.id,
      listingId: order.listingId,
      fromUserId: user.id,
      toUserId: order.sellerId,
      score,
      comment,
    });

    const { average, count } = await getAverageForUser(order.sellerId);
    await updateSellerListingRating(order.sellerId, average, count);

    return NextResponse.json({ rating, average, count }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "ALREADY_RATED"
        ? 409
        : message === "INVALID_SCORE"
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
