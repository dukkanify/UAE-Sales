import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isStripeConfigured } from "@/services/payments/payment-config";
import { logPaymentEvent } from "@/services/payments/payment-log";
import {
  handleCheckoutSessionCompleted,
  handlePaymentIntentFailed,
} from "@/services/payments/order-service";
import { getOrderById } from "@/services/payments/order-store";
import { verifyStripeWebhook } from "@/services/payments/stripe.service";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "MISSING_SIGNATURE" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = verifyStripeWebhook(payload, signature);
  } catch {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  await logPaymentEvent({
    stripeEventId: event.id,
    type: event.type,
    payload: { id: event.id },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          const order = await getOrderById(orderId);
          if (order && order.status === "pending_payment") {
            await handleCheckoutSessionCompleted({
              id: order.stripeCheckoutSessionId ?? "",
              metadata: intent.metadata,
              payment_intent: intent.id,
            });
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(intent.id, intent.metadata?.orderId);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        await logPaymentEvent({
          type: "charge.refunded",
          payload: { paymentIntentId, chargeId: charge.id },
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "WEBHOOK_HANDLER_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
