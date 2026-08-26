import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  ensureStripeConfigLoaded,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import {
  claimStripeWebhookEvent,
  logPaymentEvent,
  releaseStripeWebhookEvent,
} from "@/services/payments/payment-log";
import {
  handleCheckoutSessionCompleted,
  handlePaymentIntentFailed,
  syncRefundFromStripeCharge,
} from "@/services/payments/order-service";
import { markListingFeatured } from "@/services/payments/featured-checkout.service";
import { getOrderById } from "@/services/payments/order-store";
import { syncConnectAccountFromWebhook } from "@/services/payments/stripe-connect.service";
import { verifyStripeWebhook } from "@/services/payments/stripe.service";

export async function POST(request: Request) {
  await ensureStripeConfigLoaded();
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
    event = await verifyStripeWebhook(payload, signature);
  } catch {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  const claim = await claimStripeWebhookEvent(event.id, event.type);
  if (claim === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
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
        if (session.metadata?.type === "featured_listing") {
          const listingId = session.metadata.listingId;
          if (listingId) {
            await markListingFeatured(listingId, session.id);
          }
        } else {
          await handleCheckoutSessionCompleted(session);
        }
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
        const refundId = charge.refunds?.data?.[0]?.id;
        await syncRefundFromStripeCharge({
          paymentIntentId,
          chargeId: charge.id,
          refundId,
        });
        await logPaymentEvent({
          type: "charge.refunded.synced",
          payload: { paymentIntentId, chargeId: charge.id, refundId },
        });
        break;
      }
      case "account.updated":
      case "account.external_account.created":
      case "account.external_account.updated":
      case "capability.updated": {
        const accountObject =
          event.type === "capability.updated"
            ? null
            : (event.data.object as Stripe.Account | Stripe.BankAccount | Stripe.Card);
        let accountId: string | undefined;
        if (event.type === "account.updated") {
          accountId = (event.data.object as Stripe.Account).id;
        } else if (event.type.startsWith("account.external_account")) {
          const external = event.data.object as Stripe.BankAccount | Stripe.Card;
          accountId =
            typeof external.account === "string"
              ? external.account
              : external.account?.id;
        } else if (event.type === "capability.updated") {
          const capability = event.data.object as Stripe.Capability;
          accountId =
            typeof capability.account === "string"
              ? capability.account
              : capability.account?.id;
        }

        if (event.type === "account.updated" && accountObject) {
          await syncConnectAccountFromWebhook(accountObject as Stripe.Account);
        } else if (accountId) {
          const { getStripeClient } = await import(
            "@/services/payments/stripe.service"
          );
          const stripe = await getStripeClient();
          const account = await stripe.accounts.retrieve(accountId);
          await syncConnectAccountFromWebhook(account);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    await releaseStripeWebhookEvent(event.id);
    const message = error instanceof Error ? error.message : "WEBHOOK_HANDLER_ERROR";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
