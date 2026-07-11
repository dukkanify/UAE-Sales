import { NextResponse } from "next/server";
import { createCheckoutSchema } from "@/services/payments/payment-schemas";
import {
  completeMockPayment,
  initiateCheckout,
} from "@/services/payments/order-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_INPUT", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await initiateCheckout(parsed.data);

    if (result.mode === "mock") {
      await completeMockPayment(result.orderId);
      return NextResponse.json({
        mode: "mock",
        orderId: result.orderId,
        redirectUrl: `/checkout/success?orderId=${result.orderId}`,
      });
    }

    if (!result.checkoutUrl) {
      return NextResponse.json({
        mode: "checkout",
        orderId: result.orderId,
        redirectUrl: `/orders/${result.orderId}`,
      });
    }

    return NextResponse.json({
      mode: "checkout",
      orderId: result.orderId,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "LISTING_NOT_FOUND"
        ? 404
        : message === "CANNOT_BUY_OWN_LISTING"
          ? 403
          : message === "SHIPPING_UNAVAILABLE"
            ? 400
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
