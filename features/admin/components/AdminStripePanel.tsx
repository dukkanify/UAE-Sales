"use client";

import { AdminStripeConnectPanel } from "@/features/admin/components/AdminStripeConnectPanel";
import { adminFetch } from "@/features/admin/lib/admin-fetch";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";

type StripePayload = {
  counts: {
    events: number;
    failedOrPending: number;
    ordersWithStripe: number;
    refunded: number;
  };
  links: {
    apiKeys: string;
    balances: string;
    customers: string;
    dashboard: string;
    disputes: string;
    payments: string;
    webhooks: string;
  };
  recentEvents: {
    createdAt: string;
    id: string;
    orderId?: string;
    type: string;
  }[];
  recentStripeOrders: {
    amount: number;
    createdAt: string;
    id: string;
    paymentStatus: string;
    status: string;
    stripePaymentIntentId?: string;
    title: string;
  }[];
  status: {
    configured: boolean;
    currency: string;
    envManaged: boolean;
    mockAllowed: boolean;
    publishableConfigured: boolean;
    publishableKeyMasked: string | null;
    secretKeyMasked: string | null;
    secretKeyPresent: boolean;
    source: "env" | "admin" | "none";
    updatedAt: string | null;
    webhookConfigured: boolean;
    webhookEndpoint: string;
    webhookSecretMasked: string | null;
  };
};

/** Platform keys live in Vercel Production — never paste secrets in the browser. */
export function AdminStripePanel() {
  const [data, setData] = useState<StripePayload | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    let cancelled = false;
    adminFetch("/api/admin/stripe")
      .then((res) => res.json())
      .then((payload) => {
        if (!cancelled && payload?.status) setData(payload as StripePayload);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div className="grid gap-5">
        <AdminStripeConnectPanel mode="manage" />
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري تحميل حالة Stripe...</p>
        </Card>
      </div>
    );
  }

  const { status, links, counts, recentStripeOrders, recentEvents } = data;

  return (
    <div className="grid gap-5">
      <AdminStripeConnectPanel
        key={`connect-${status.configured ? "ready" : "waiting"}`}
        mode="manage"
        platformConfigured={status.configured}
      />

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">إعداد المنصة (خوادم)</h2>
        <p className="admin-ops__panel-sub">
          مفاتيح Stripe الرئيسية تُضبط مرة واحدة عبر Vercel Production. لا تُدخل Secret
          Key أو Webhook Secret في المتصفح.
        </p>

        {!status.configured ? (
          <div className="mt-3">
            <FormMessage variant="error">
              إعداد Stripe الرئيسي غير مكتمل. يرجى إكمال إعدادات المنصة.
            </FormMessage>
          </div>
        ) : (
          <div className="mt-3">
            <FormMessage variant="success">
              إعداد Stripe الرئيسي مكتمل على الخادم. يمكنك متابعة ربط Connect أدناه.
            </FormMessage>
          </div>
        )}

        <div className="admin-ops__status-row" style={{ marginTop: "1rem" }}>
          <div
            className={`admin-ops__status-chip${
              status.configured
                ? " admin-ops__status-chip--ok"
                : " admin-ops__status-chip--warn"
            }`}
          >
            المنصة: {status.configured ? "جاهزة" : "غير مكتملة"}
          </div>
          <div
            className={`admin-ops__status-chip${
              status.publishableConfigured ? " admin-ops__status-chip--ok" : ""
            }`}
          >
            Publishable: {status.publishableConfigured ? "مضبوط" : "ناقص"}
          </div>
          <div
            className={`admin-ops__status-chip${
              status.webhookConfigured ? " admin-ops__status-chip--ok" : ""
            }`}
          >
            Webhook: {status.webhookConfigured ? "مضبوط" : "ناقص"}
          </div>
          <div className="admin-ops__status-chip">
            المصدر:{" "}
            {status.source === "env"
              ? "Vercel Env"
              : status.source === "admin"
                ? "مخزّن على الخادم"
                : "غير مضبوط"}
          </div>
          <div className="admin-ops__status-chip">
            العملة {status.currency.toUpperCase()}
          </div>
          <div className="admin-ops__status-chip">
            Mock: {status.mockAllowed ? "مسموح" : "مغلق"}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Webhook endpoint:{" "}
          <code className="text-[0.7rem]">{status.webhookEndpoint}</code>
        </p>
      </section>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">روابط لوحة Stripe</h2>
        <div
          className="admin-ops__quick-links"
          style={{ marginTop: "0.85rem" }}
        >
          {[
            ["Dashboard", links.dashboard],
            ["Payments", links.payments],
            ["Webhooks", links.webhooks],
            ["Customers", links.customers],
            ["Balance", links.balances],
            ["Disputes", links.disputes],
          ].map(([label, href]) => (
            <a
              key={label}
              className="admin-ops__chip-link"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">طلبات بـ PaymentIntent</p>
          <p className="admin-ops__kpi-value">{counts.ordersWithStripe}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">فشل / معلّق</p>
          <p className="admin-ops__kpi-value">{counts.failedOrPending}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">مسترد</p>
          <p className="admin-ops__kpi-value">{counts.refunded}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">أحداث الدفع</p>
          <p className="admin-ops__kpi-value">{counts.events}</p>
        </div>
      </div>

      <section className="admin-ops__panel">
        <div className="admin-ops__panel-head">
          <h2 className="admin-ops__panel-title">طلبات مرتبطة بـ Stripe</h2>
          <Link className="admin-ops__text-link" href="/admin/orders">
            كل الطلبات
          </Link>
        </div>
        <ul className="admin-ops__queue" style={{ marginTop: "0.85rem" }}>
          {recentStripeOrders.length === 0 ? (
            <li className="admin-ops__queue-item">
              <p className="admin-ops__queue-meta">لا توجد طلبات مرتبطة بعد.</p>
            </li>
          ) : (
            recentStripeOrders.map((order) => (
              <li key={order.id} className="admin-ops__queue-item">
                <div>
                  <p className="admin-ops__queue-label">{order.title}</p>
                  <p className="admin-ops__queue-meta">
                    {order.stripePaymentIntentId ?? order.id} ·{" "}
                    {new Date(order.createdAt).toLocaleString("ar-AE")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyAmount amount={order.amount} size="sm" />
                  <Badge variant="muted">{order.paymentStatus}</Badge>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">سجل أحداث الدفع</h2>
        <ul className="admin-ops__queue" style={{ marginTop: "0.85rem" }}>
          {recentEvents.map((event) => (
            <li key={event.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{event.type}</p>
                <p className="admin-ops__queue-meta">
                  {new Date(event.createdAt).toLocaleString("ar-AE")}
                  {event.orderId ? ` · ${event.orderId}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
