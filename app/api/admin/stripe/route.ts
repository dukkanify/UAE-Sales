import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireAdminUser,
} from "@/services/auth/require-session";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import {
  ensureStripeConfigLoaded,
  getStripeCurrency,
  getStripePublishableKey,
  getStripeSecretKey,
  getStripeWebhookSecret,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import {
  clearStripeCredentials,
  maskSecret,
  saveStripeCredentials,
} from "@/services/payments/stripe-credentials-store";
import { resetStripeClient } from "@/services/payments/stripe.service";
import Stripe from "stripe";

const saveSchema = z.object({
  secretKey: z.string().optional(),
  publishableKey: z.string().optional(),
  webhookSecret: z.string().optional(),
  clearSecret: z.boolean().optional(),
  clearPublishable: z.boolean().optional(),
  clearWebhook: z.boolean().optional(),
  testConnection: z.boolean().optional(),
});

async function buildStripePayload() {
  const config = await ensureStripeConfigLoaded(true);
  const settings = await getAdminSettings();
  const [orders, events] = await Promise.all([getAllOrders(), getPaymentEvents()]);

  const withStripe = orders.filter((o) => Boolean(o.stripePaymentIntentId));
  const failed = orders.filter(
    (o) => o.paymentStatus === "failed" || o.paymentStatus === "pending",
  );
  const refunded = orders.filter((o) => o.status === "refunded");
  const base = settings.stripeDashboardUrl.replace(/\/$/, "");
  const envManaged = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

  return {
    status: {
      configured: isStripeConfigured(),
      publishableConfigured: Boolean(getStripePublishableKey()),
      webhookConfigured: Boolean(getStripeWebhookSecret()),
      currency: getStripeCurrency(),
      mockAllowed: isMockCheckoutAllowed(),
      secretKeyPresent: isStripeConfigured(),
      source: config.source,
      envManaged,
      secretKeyMasked: maskSecret(getStripeSecretKey()),
      publishableKeyMasked: maskSecret(getStripePublishableKey()),
      webhookSecretMasked: maskSecret(getStripeWebhookSecret()),
      updatedAt: config.updatedAt ?? null,
      webhookEndpoint: "https://sooqna.site/api/webhooks/stripe",
    },
    links: {
      dashboard: base,
      payments: `${base}/payments`,
      webhooks: `${base}/webhooks`,
      customers: `${base}/customers`,
      balances: `${base}/balance`,
      disputes: `${base}/disputes`,
      apiKeys: `${base}/apikeys`,
    },
    counts: {
      ordersWithStripe: withStripe.length,
      failedOrPending: failed.length,
      refunded: refunded.length,
      events: events.length,
    },
    recentStripeOrders: withStripe.slice(0, 12).map((order) => ({
      id: order.id,
      title: order.listingTitle,
      amount: order.fees.total,
      paymentStatus: order.paymentStatus,
      status: order.status,
      stripePaymentIntentId: order.stripePaymentIntentId,
      createdAt: order.createdAt,
    })),
    recentEvents: events.slice(0, 20),
  };
}

export async function GET() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  return NextResponse.json(await buildStripePayload());
}

export async function PUT(request: Request) {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  if (process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "ENV_MANAGED",
        message:
          "Stripe secret is already set in Vercel environment variables. Update keys there, or remove STRIPE_SECRET_KEY to manage from admin.",
      },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await saveStripeCredentials(parsed.data);
    resetStripeClient();
    await ensureStripeConfigLoaded(true);

    let connection: { ok: boolean; mode?: string | null; error?: string } | null =
      null;
    if (parsed.data.testConnection !== false && isStripeConfigured()) {
      try {
        const stripe = new Stripe(getStripeSecretKey()!, {
          apiVersion: "2026-06-24.dahlia",
        });
        const balance = await stripe.balance.retrieve();
        connection = {
          ok: true,
          mode: balance.livemode ? "live" : "test",
        };
      } catch (error) {
        connection = {
          ok: false,
          error: error instanceof Error ? error.message : "CONNECTION_FAILED",
        };
      }
    }

    return NextResponse.json({
      ok: true,
      connection,
      ...(await buildStripePayload()),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SAVE_FAILED";
    const status =
      message === "INVALID_SECRET_KEY" ||
      message === "INVALID_PUBLISHABLE_KEY" ||
      message === "INVALID_WEBHOOK_SECRET"
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  if (process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json({ error: "ENV_MANAGED" }, { status: 409 });
  }

  await clearStripeCredentials();
  resetStripeClient();
  return NextResponse.json({
    ok: true,
    ...(await buildStripePayload()),
  });
}
