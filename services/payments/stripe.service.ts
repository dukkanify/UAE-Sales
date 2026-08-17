import Stripe from "stripe";
import type { Order } from "@/types/domain/order";
import type { CheckoutSessionResult } from "@/types/domain/payment";
import {
  getAppUrl,
  getStripeCurrency,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import { logPaymentEvent } from "@/services/payments/payment-log";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey()!, {
      apiVersion: "2026-06-24.dahlia",
    });
  }
  return stripeClient;
}

function orderMetadata(order: Order): Record<string, string> {
  return {
    orderId: order.id,
    listingId: order.listingId,
    buyerId: order.buyerId ?? "",
    sellerId: order.sellerId,
    platform: "sooqna",
    escrow: "true",
    shippingMethod: order.shippingMethod ?? "",
  };
}

export type CreateCheckoutSessionInput = {
  order: Order;
  buyerEmail: string;
  listingTitle: string;
  /** Use a fresh idempotency key when recreating after an expired/closed session. */
  freshSession?: boolean;
};

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const currency = getStripeCurrency();
  const listingParam = input.order.listingSlug ?? input.order.listingId;
  const metadata = orderMetadata(input.order);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      locale: "auto",
      customer_email: input.buyerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(input.order.fees.total * 100),
            product_data: {
              name: input.listingTitle,
              description: `طلب ${input.order.id} — سوقنا`,
            },
          },
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
        description: `Sooqna escrow — ${input.order.id}`,
      },
      success_url: `${appUrl}/checkout/success?orderId=${encodeURIComponent(input.order.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?listingId=${encodeURIComponent(listingParam)}&payment=cancelled`,
    },
    {
      idempotencyKey: input.freshSession
        ? `checkout-${input.order.id}-${Date.now()}`
        : `checkout-${input.order.id}`,
    },
  );

  await logPaymentEvent({
    orderId: input.order.id,
    type: "checkout.session.created",
    payload: { sessionId: session.id },
  });

  return {
    mode: "checkout",
    orderId: input.order.id,
    checkoutUrl: session.url ?? undefined,
    sessionId: session.id,
  };
}

export async function retrieveCheckoutSession(
  sessionId: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function createPaymentIntent(order: Order) {
  const stripe = getStripeClient();
  const currency = getStripeCurrency();
  const metadata = orderMetadata(order);

  return stripe.paymentIntents.create(
    {
      amount: Math.round(order.fees.total * 100),
      currency,
      metadata,
      description: `Sooqna escrow — ${order.id}`,
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: `pi-${order.id}` },
  );
}

export function verifyStripeWebhook(payload: string, signature: string): Stripe.Event {
  const stripe = getStripeClient();
  const secret = getStripeWebhookSecret();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET_MISSING");
  }
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export async function getStripePaymentStatus(
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent.Status> {
  const stripe = getStripeClient();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status;
}

export async function refundStripePayment(
  paymentIntentId: string,
  orderId: string,
): Promise<Stripe.Refund> {
  const stripe = getStripeClient();
  const refund = await stripe.refunds.create(
    { payment_intent: paymentIntentId },
    { idempotencyKey: `refund-${orderId}` },
  );

  await logPaymentEvent({
    orderId,
    type: "charge.refunded",
    payload: { refundId: refund.id, paymentIntentId },
  });

  return refund;
}

export type CreateFeaturedCheckoutInput = {
  listingId: string;
  listingTitle: string;
  userId: string;
  email: string;
  amountAed: number;
};

export async function createFeaturedCheckoutSession(
  input: CreateFeaturedCheckoutInput,
): Promise<{ checkoutUrl?: string; sessionId: string }> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const currency = getStripeCurrency();
  const metadata = {
    type: "featured_listing",
    listingId: input.listingId,
    userId: input.userId,
    platform: "sooqna",
  };

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      locale: "auto",
      customer_email: input.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(input.amountAed * 100),
            product_data: {
              name: `تمييز إعلان — ${input.listingTitle}`,
              description: "باقة تمييز الإعلان — سوقنا",
            },
          },
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
        description: `Sooqna featured listing — ${input.listingId}`,
      },
      success_url: `${appUrl}/dashboard/listings?featured=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/listings?featured=cancelled`,
    },
    {
      idempotencyKey: `featured-${input.listingId}-${Date.now()}`,
    },
  );

  await logPaymentEvent({
    type: "checkout.session.created.featured",
    payload: { sessionId: session.id, listingId: input.listingId },
  });

  return {
    checkoutUrl: session.url ?? undefined,
    sessionId: session.id,
  };
}

export { isStripeConfigured };
