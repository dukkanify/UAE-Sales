import { NextResponse } from "next/server";
import { resolveOrderFromCheckoutSession } from "@/services/payments/order-service";

/** Confirm order after Stripe redirect using Checkout Session id. */
export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "MISSING_SESSION_ID" }, { status: 400 });
  }

  try {
    const order = await resolveOrderFromCheckoutSession(sessionId);
    if (!order) {
      return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
