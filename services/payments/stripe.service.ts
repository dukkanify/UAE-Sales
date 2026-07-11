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

export type CreateCheckoutSessionInput = {
  order: Order;
  buyerEmail: string;
  listingTitle: string;
};

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const currency = getStripeCurrency();
  const listingParam = input.order.listingSlug ?? input.order.listingId;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: input.buyerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: input.order.fees.total * 100,
            product_data: {
              name: input.listingTitle,
              description: `طلب ${input.order.id} — سوقنا`,
            },
          },
        },
      ],
      metadata: {
        orderId: input.order.id,
        listingId: input.order.listingId,
        buyerId: input.order.buyerId,
        sellerId: input.order.sellerId,
        platform: "sooqna",
        escrow: "true",
        shippingMethod: input.order.shippingMethod ?? "",
      },
      success_url: `${appUrl}/orders/${input.order.id}?payment=success`,
      cancel_url: `${appUrl}/checkout?listingId=${listingParam}&payment=cancelled`,
    },
    {
      idempotencyKey: `checkout-${input.order.id}`,
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

export async function createPaymentIntent(order: Order) {
  const stripe = getStripeClient();
  const currency = getStripeCurrency();

  return stripe.paymentIntents.create(
    {
      amount: order.fees.total * 100,
      currency,
      metadata: {
        orderId: order.id,
        listingId: order.listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        platform: "sooqna",
        escrow: "true",
      },
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

export { isStripeConfigured };
