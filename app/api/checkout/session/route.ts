import { NextResponse } from "next/server";
import { isMockCheckoutAllowed } from "@/services/payments/payment-config";
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

    if (parsed.data.forceMock && !isMockCheckoutAllowed()) {
      return NextResponse.json({ error: "MOCK_CHECKOUT_NOT_ALLOWED" }, { status: 403 });
    }

    const result = await initiateCheckout(parsed.data);

    if (result.mode === "mock") {
      if (!isMockCheckoutAllowed()) {
        return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
      }

      const paymentResult = await completeMockPayment(result.orderId);
      const params = new URLSearchParams({ orderId: result.orderId });
      if (paymentResult.guestAccessToken) {
        params.set("token", paymentResult.guestAccessToken);
      }

      return NextResponse.json({
        mode: "mock",
        orderId: result.orderId,
        redirectUrl: `/checkout/success?${params.toString()}`,
        guestAccessToken: paymentResult.guestAccessToken,
        hasExistingAccount: paymentResult.hasExistingAccount,
      });
    }

    if (!result.checkoutUrl) {
      return NextResponse.json(
        { error: "CHECKOUT_URL_MISSING", orderId: result.orderId },
        { status: 502 },
      );
    }

    return NextResponse.json({
      mode: "checkout",
      orderId: result.orderId,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status =
      message === "LISTING_NOT_FOUND"
        ? 404
        : message === "CANNOT_BUY_OWN_LISTING" ||
            message === "GUEST_CHECKOUT_DISABLED"
          ? 403
          : message === "STRIPE_NOT_CONFIGURED"
            ? 503
            : message === "SHIPPING_UNAVAILABLE"
              ? 400
              : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
