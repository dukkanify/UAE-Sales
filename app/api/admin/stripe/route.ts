import { NextResponse } from "next/server";
import { getAdminSettings } from "@/services/admin/admin-settings-store";
import { getAllOrders } from "@/services/payments/order-store";
import { getPaymentEvents } from "@/services/payments/payment-log";
import {
  getStripeCurrency,
  getStripePublishableKey,
  getStripeWebhookSecret,
  isMockCheckoutAllowed,
  isStripeConfigured,
} from "@/services/payments/payment-config";

export async function GET(request: Request) {
  const role = request.headers.get("x-admin-role");
  if (role !== "admin") {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const settings = await getAdminSettings();
  const [orders, events] = await Promise.all([getAllOrders(), getPaymentEvents()]);

  const withStripe = orders.filter((o) => Boolean(o.stripePaymentIntentId));
  const failed = orders.filter(
    (o) => o.paymentStatus === "failed" || o.paymentStatus === "pending",
  );
  const refunded = orders.filter((o) => o.status === "refunded");
  const base = settings.stripeDashboardUrl.replace(/\/$/, "");

  return NextResponse.json({
    status: {
      configured: isStripeConfigured(),
      publishableConfigured: Boolean(getStripePublishableKey()),
      webhookConfigured: Boolean(getStripeWebhookSecret()),
      currency: getStripeCurrency(),
      mockAllowed: isMockCheckoutAllowed(),
      secretKeyPresent: isStripeConfigured(),
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
  });
}
