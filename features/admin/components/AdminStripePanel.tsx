"use client";

import { AdminStripeConnectPanel } from "@/features/admin/components/AdminStripeConnectPanel";
import { adminFetch } from "@/features/admin/lib/admin-fetch";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";

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

export function AdminStripePanel() {
  const [data, setData] = useState<StripePayload | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    variant: "success" | "error";
  } | null>(null);

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

  async function saveCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/stripe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretKey: secretKey.trim() || undefined,
          publishableKey: publishableKey.trim() || undefined,
          webhookSecret: webhookSecret.trim() || undefined,
          testConnection: true,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          ENV_MANAGED:
            "المفاتيح مضبوطة من Vercel. احذف STRIPE_SECRET_KEY من البيئة لإدارتها من هنا.",
          INVALID_SECRET_KEY:
            "Secret Key غير صالح. يجب أن يبدأ بـ sk_live_ أو sk_test_ (ليس mk_).",
          INVALID_PUBLISHABLE_KEY:
            "Publishable Key غير صالح. يجب أن يبدأ بـ pk_live_ أو pk_test_.",
          INVALID_WEBHOOK_SECRET:
            "Webhook Secret غير صالح. يجب أن يبدأ بـ whsec_.",
        };
        setMessage({
          variant: "error",
          text: map[payload.error] ?? payload.message ?? "تعذر حفظ المفاتيح.",
        });
        return;
      }
      if (payload?.status) setData(payload as StripePayload);
      setSecretKey("");
      setPublishableKey("");
      setWebhookSecret("");
      const connectionOk = payload.connection?.ok;
      setMessage({
        variant: connectionOk === false ? "error" : "success",
        text:
          connectionOk === false
            ? `تم الحفظ لكن الاتصال فشل: ${payload.connection?.error ?? "تحقق من المفتاح"}`
            : connectionOk
              ? "تم تفعيل Stripe بنجاح والتحقق من الاتصال."
              : "تم حفظ مفاتيح Stripe.",
      });
    } catch {
      setMessage({ variant: "error", text: "تعذر حفظ المفاتيح." });
    } finally {
      setBusy(false);
    }
  }

  async function clearCredentials() {
    if (!window.confirm("حذف مفاتيح Stripe المحفوظة من لوحة الأدمن؟")) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminFetch("/api/admin/stripe", { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) {
        setMessage({
          variant: "error",
          text:
            payload.error === "ENV_MANAGED"
              ? "المفاتيح مضبوطة من Vercel ولا يمكن حذفها من هنا."
              : "تعذر الحذف.",
        });
        return;
      }
      if (payload?.status) setData(payload as StripePayload);
      setMessage({ variant: "success", text: "تم حذف مفاتيح الأدمن." });
    } catch {
      setMessage({ variant: "error", text: "تعذر الحذف." });
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className="grid gap-5">
        <AdminStripeConnectPanel mode="manage" />
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري تحميل حالة مفاتيح المنصة...</p>
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
      />

      <div className="admin-ops__status-row">
        <div
          className={`admin-ops__status-chip${
            status.configured
              ? " admin-ops__status-chip--ok"
              : " admin-ops__status-chip--warn"
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
          المصدر:{" "}
          {status.source === "env"
            ? "Vercel Env"
            : status.source === "admin"
              ? "لوحة الأدمن"
              : "غير مضبوط"}
        </div>
        <div className="admin-ops__status-chip">
          العملة {status.currency.toUpperCase()}
        </div>
        <div className="admin-ops__status-chip">
          Mock: {status.mockAllowed ? "مسموح" : "مغلق"}
        </div>
      </div>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">مفاتيح منصة Stripe</h2>
        <p className="admin-ops__panel-sub">
          مطلوبة لإنشاء حسابات Connect وروابط الإعداد على الخادم فقط. لا تُعرض
          Secret Key في المتصفح بعد الحفظ.
        </p>

        {message ? (
          <div className="mt-3">
            <FormMessage variant={message.variant}>{message.text}</FormMessage>
          </div>
        ) : null}

        {status.envManaged ? (
          <FormMessage variant="error">
            المفاتيح مضبوطة حالياً عبر متغيرات Vercel. لإدارتها من هنا احذف{" "}
            <code className="text-xs">STRIPE_SECRET_KEY</code> من Production ثم
            Redeploy.
          </FormMessage>
        ) : (
          <form className="mt-4 grid gap-3" onSubmit={saveCredentials}>
            <Input
              autoComplete="off"
              disabled={busy}
              label={`Secret Key ${status.secretKeyMasked ? `(${status.secretKeyMasked})` : ""}`}
              onChange={(event) => setSecretKey(event.target.value)}
              placeholder="sk_live_..."
              type="password"
              value={secretKey}
            />
            <Input
              autoComplete="off"
              disabled={busy}
              label={`Publishable Key ${status.publishableKeyMasked ? `(${status.publishableKeyMasked})` : ""}`}
              onChange={(event) => setPublishableKey(event.target.value)}
              placeholder="pk_live_..."
              type="password"
              value={publishableKey}
            />
            <Input
              autoComplete="off"
              disabled={busy}
              label={`Webhook Secret ${status.webhookSecretMasked ? `(${status.webhookSecretMasked})` : ""}`}
              onChange={(event) => setWebhookSecret(event.target.value)}
              placeholder="whsec_..."
              type="password"
              value={webhookSecret}
            />
            <p className="text-xs text-muted">
              أنشئ Webhook على{" "}
              <code className="text-[0.7rem]">{status.webhookEndpoint}</code> ثم
              الصق Signing secret هنا. اترك الحقل فارغاً إذا لم تغيّره.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button loading={busy} type="submit">
                حفظ وتفعيل
              </Button>
              <Button
                disabled={busy || status.source !== "admin"}
                onClick={clearCredentials}
                type="button"
                variant="ghost"
              >
                حذف مفاتيح الأدمن
              </Button>
              <a
                className="admin-ops__chip-link"
                href={links.apiKeys}
                rel="noopener noreferrer"
                target="_blank"
              >
                فتح API Keys
              </a>
              <a
                className="admin-ops__chip-link"
                href={links.webhooks}
                rel="noopener noreferrer"
                target="_blank"
              >
                فتح Webhooks
              </a>
            </div>
          </form>
        )}

        <ol className="mt-4 grid gap-2 text-sm text-muted">
          <li>
            1. انسخ <strong className="text-ink">sk_live_</strong> و{" "}
            <strong className="text-ink">pk_live_</strong> من Stripe → API keys
          </li>
          <li>
            2. Webhooks → Add endpoint →{" "}
            <code className="text-xs">{status.webhookEndpoint}</code>
          </li>
          <li>
            3. أحداث:{" "}
            <code className="text-xs">checkout.session.completed</code>،{" "}
            <code className="text-xs">payment_intent.*</code>،{" "}
            <code className="text-xs">charge.refunded</code>،{" "}
            <code className="text-xs">account.updated</code>
          </li>
          <li>4. الصق Signing secret (`whsec_...`) واضغط حفظ وتفعيل</li>
        </ol>
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
            ["API Keys", links.apiKeys],
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
