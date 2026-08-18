import { NextResponse } from "next/server";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import { markListingFeatured } from "@/services/payments/featured-checkout.service";
import { getFeaturedPayments } from "@/services/listings/featured-payment-store";

/** Confirm featured listing after Stripe success redirect (webhook backup). */
export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;

  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
  } | null;
  const sessionId = body?.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "MISSING_SESSION_ID" }, { status: 400 });
  }

  const payments = await getFeaturedPayments();
  const record = payments.find((item) => item.stripeSessionId === sessionId);
  if (!record || record.userId !== user.id) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  try {
    const listing = await markListingFeatured(record.listingId, sessionId);
    return NextResponse.json({ listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
