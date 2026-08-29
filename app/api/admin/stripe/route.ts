import { NextResponse } from "next/server";
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
} from "@/services/payments/stripe-credentials-store";
import { resetStripeClient } from "@/services/payments/stripe.service";

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

/** Browser key paste is disabled — platform keys belong in Vercel Production. */
export async function PUT() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  return NextResponse.json(
    {
      error: "USE_VERCEL_ENV",
      message:
        "إعداد Stripe الرئيسي غير مكتمل عبر واجهة المتصفح. اضبط المفاتيح في Vercel Production ثم أعد النشر.",
    },
    { status: 403 },
  );
}

export async function DELETE() {
  const admin = await requireAdminUser();
  if (!isSessionUser(admin)) {
    return admin;
  }

  if (process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json(
      {
        error: "ENV_MANAGED",
        message:
          "المفاتيح مضبوطة عبر Vercel ولا يمكن حذفها من لوحة الأدمن.",
      },
      { status: 409 },
    );
  }

  await clearStripeCredentials();
  resetStripeClient();
  return NextResponse.json({
    ok: true,
    ...(await buildStripePayload()),
  });
}
