/**
 * Payment gateway adapters — mock (default) + Stripe Checkout-ready.
 * Never stores raw card data (PCI-aware).
 */

import { generateId, generateToken } from "@/lib/security/crypto";
import type {
  PaymentMethodBrand,
  PaymentProvider,
  PaymentRecord,
} from "@/types/payments";
import { readPaymentsDb } from "@/services/payments/store";
import { PaymentError } from "@/services/payments/access";

export interface GatewayChargeInput {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  methodBrand: PaymentMethodBrand;
  paymentToken?: string;
  successUrl?: string;
  cancelUrl?: string;
  idempotencyKey: string;
  simulateFailure?: boolean;
}

export interface GatewayChargeResult {
  provider: PaymentProvider;
  providerPaymentId: string;
  status: PaymentRecord["status"];
  clientSecret: string | null;
  checkoutUrl: string | null;
  methodBrand: PaymentMethodBrand;
  paymentMethodSummary: string;
  rawProviderPayload: Record<string, unknown>;
  failureCode: string | null;
  failureMessage: string | null;
}

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  createPayment(input: GatewayChargeInput): Promise<GatewayChargeResult>;
  confirmWebhook(payload: string, signature: string | null): Promise<{
    providerPaymentId: string;
    status: PaymentRecord["status"];
    raw: Record<string, unknown>;
  }>;
}

function maskToken(token?: string): string {
  if (!token) return "••••";
  return `•••• ${token.slice(-4).toUpperCase()}`;
}

class MockGateway implements PaymentGateway {
  readonly provider = "mock" as const;

  async createPayment(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    if (input.simulateFailure || input.paymentToken === "fail") {
      return {
        provider: "mock",
        providerPaymentId: `mock_fail_${generateId().slice(0, 10)}`,
        status: "failed",
        clientSecret: null,
        checkoutUrl: null,
        methodBrand: input.methodBrand,
        paymentMethodSummary: `${input.methodBrand.toUpperCase()} ${maskToken(input.paymentToken)}`,
        rawProviderPayload: { simulated: true, failed: true },
        failureCode: "card_declined",
        failureMessage: "The payment method was declined (simulated).",
      };
    }

    const providerPaymentId = `mock_pay_${generateId().slice(0, 12)}`;
    return {
      provider: "mock",
      providerPaymentId,
      status: "succeeded",
      clientSecret: `mock_secret_${generateToken(8)}`,
      checkoutUrl: null,
      methodBrand: input.methodBrand,
      paymentMethodSummary: `${input.methodBrand.toUpperCase()} ${maskToken(input.paymentToken ?? "4242")}`,
      rawProviderPayload: {
        simulated: true,
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
        idempotencyKey: input.idempotencyKey,
      },
      failureCode: null,
      failureMessage: null,
    };
  }

  async confirmWebhook(payload: string, signature: string | null) {
    if (signature && signature !== "mock_whsec") {
      throw new PaymentError("Invalid webhook signature", 401);
    }
    const data = JSON.parse(payload) as {
      providerPaymentId?: string;
      status?: PaymentRecord["status"];
    };
    return {
      providerPaymentId: data.providerPaymentId ?? "",
      status: data.status ?? "succeeded",
      raw: data as Record<string, unknown>,
    };
  }
}

class StripeGateway implements PaymentGateway {
  readonly provider = "stripe" as const;

  async createPayment(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      const stubId = `cs_test_${generateId().slice(0, 14)}`;
      return {
        provider: "stripe",
        providerPaymentId: stubId,
        status: "requires_payment",
        clientSecret: null,
        checkoutUrl: `/student/checkout/confirm?session=${stubId}&order=${input.orderId}`,
        methodBrand: input.methodBrand,
        paymentMethodSummary: "Stripe Checkout (test stub)",
        rawProviderPayload: {
          mode: "stub",
          note: "Set STRIPE_SECRET_KEY to create live Checkout Sessions",
          orderId: input.orderId,
        },
        failureCode: null,
        failureMessage: null,
      };
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);

    // Dynamic payment methods — omit payment_method_types (Apple Pay / Google Pay / cards via Dashboard)
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.customerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: input.amount,
              product_data: {
                name: `Order ${input.orderId}`,
              },
            },
          },
        ],
        success_url:
          input.successUrl ??
          `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/student/billing?paid=1`,
        cancel_url:
          input.cancelUrl ??
          `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/student/checkout?canceled=1`,
        metadata: {
          orderId: input.orderId,
          idempotencyKey: input.idempotencyKey,
        },
      },
      { idempotencyKey: input.idempotencyKey },
    );

    return {
      provider: "stripe",
      providerPaymentId: session.id,
      status: "requires_payment",
      clientSecret: null,
      checkoutUrl: session.url,
      methodBrand: input.methodBrand,
      paymentMethodSummary: "Stripe Checkout",
      rawProviderPayload: { sessionId: session.id, status: session.status },
      failureCode: null,
      failureMessage: null,
    };
  }

  async confirmWebhook(payload: string, signature: string | null) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new PaymentError("Stripe webhook secret not configured", 500);
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder");
    const event = stripe.webhooks.constructEvent(payload, signature ?? "", secret);
    const obj = event.data.object as { id?: string; payment_status?: string };
    const status =
      obj.payment_status === "paid" || event.type === "checkout.session.completed"
        ? "succeeded"
        : "processing";
    return {
      providerPaymentId: obj.id ?? event.id,
      status: status as PaymentRecord["status"],
      raw: event as unknown as Record<string, unknown>,
    };
  }
}

export function getPaymentGateway(): PaymentGateway {
  const provider = readPaymentsDb().settings.provider;
  if (provider === "stripe") return new StripeGateway();
  return new MockGateway();
}
