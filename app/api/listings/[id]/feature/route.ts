import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { initiateFeaturedCheckout } from "@/services/payments/featured-checkout.service";
import type { Listing } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const { id } = await params;
  let listingPayload: Listing | undefined;
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { listing?: Listing };
      listingPayload = body.listing;
    }
  } catch {
    listingPayload = undefined;
  }

  try {
    const result = await initiateFeaturedCheckout(id, user.id, listingPayload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "LISTING_NOT_FOUND"
        ? 404
        : message === "UNAUTHORIZED"
          ? 403
          : message === "ALREADY_FEATURED"
            ? 409
            : message === "STRIPE_NOT_CONFIGURED"
              ? 503
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
