"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";

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
  recentEvents: { createdAt: string; id: string; orderId?: string; type: string }[];
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
    mockAllowed: boolean;
    publishableConfigured: boolean;
    secretKeyPresent: boolean;
    webhookConfigured: boolean;
  };
};

export function AdminStripePanel() {
  const [data, setData] = useState<StripePayload | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/stripe", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.status) setData(payload as StripePayload);
      })
      .catch(() => undefined);
  }, []);

  if (!data) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل حالة Stripe...</p>
      </Card>
    );
  }

  const { status, links, counts, recentStripeOrders, recentEvents } = data;

  return (
    <div className="grid gap-5">
      <div className="admin-ops__status-row">
        <div
          className={`admin-ops__status-chip${
            status.configured ? " admin-ops__status-chip--ok" : " admin-ops__status-chip--warn"
          }`}
        >
          Secret Key: {status.secretKeyPresent ? "موجود" : "ناقص"}
        </div>
        <div
          className={`admin-ops__status-chip${
            status.publishableConfigured ? " admin-ops__status-chip--ok" : ""
          }`}
        >
          Publishable: {status.publishableConfigured ? "موجود" : "ناقص"}
        </div>
        <div
          className={`admin-ops__status-chip${
            status.webhookConfigured ? " admin-ops__status-chip--ok" : ""
          }`}
        >
          Webhook: {status.webhookConfigured ? "موجود" : "ناقص"}
        </div>
        <div className="admin-ops__status-chip">
          العملة {status.currency.toUpperCase()}
        </div>
        <div className="admin-ops__status-chip">
          Mock: {status.mockAllowed ? "مسموح" : "مغلق"}
        </div>
      </div>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">روابط لوحة Stripe</h2>
        <p className="admin-ops__panel-sub">
          افتح حساب Stripe مباشرة للتحكم بالمدفوعات، المفاتيح، والنزاعات.
        </p>
        <div className="admin-ops__quick-links" style={{ marginTop: "0.85rem" }}>
          <a className="admin-ops__chip-link" href={links.dashboard} rel="noopener noreferrer" target="_blank">
            Dashboard
          </a>
          <a className="admin-ops__chip-link" href={links.payments} rel="noopener noreferrer" target="_blank">
            Payments
          </a>
          <a className="admin-ops__chip-link" href={links.webhooks} rel="noopener noreferrer" target="_blank">
            Webhooks
          </a>
          <a className="admin-ops__chip-link" href={links.customers} rel="noopener noreferrer" target="_blank">
            Customers
          </a>
          <a className="admin-ops__chip-link" href={links.balances} rel="noopener noreferrer" target="_blank">
            Balance
          </a>
          <a className="admin-ops__chip-link" href={links.disputes} rel="noopener noreferrer" target="_blank">
            Disputes
          </a>
          <a className="admin-ops__chip-link" href={links.apiKeys} rel="noopener noreferrer" target="_blank">
            API Keys
          </a>
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
