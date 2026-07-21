"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";

type AttentionItem = {
  alert?: boolean;
  count: number;
  href: string;
  label: string;
  meta: string;
};

type SectionItem = {
  count: number;
  group: string;
  href: string;
  label: string;
  meta: string;
};

type DailyPoint = {
  date: string;
  fees: number;
  label: string;
  orders: number;
  volume: number;
};

type Slice = { count: number; key: string; label: string };

type OpsSummary = {
  analytics: {
    daily: DailyPoint[];
    orderStatuses: Slice[];
    paymentStatuses: Slice[];
    topCategories: Slice[];
  };
  attention: AttentionItem[];
  kpis: {
    conversionRate: number;
    currency: string;
    fees: number;
    heldEscrow: number;
    openDisputes: number;
    paidOrders: number;
    pendingListings: number;
    recentEvents: number;
    refundedOrders: number;
    totalListings: number;
    totalOrders: number;
    totalUsers: number;
    volume: number;
    walletAccounts: number;
    walletAvailable: number;
    walletHeld: number;
  };
  pulse: { id: string; orderId?: string; text: string; time?: string }[];
  sections: SectionItem[];
  settings: {
    escrowHoldDays: number;
    maintenanceMode: boolean;
    platformFeePercent: number;
  };
  stripe: {
    configured: boolean;
    currency: string;
    customersUrl: string;
    dashboardUrl: string;
    mockAllowed: boolean;
    paymentsUrl: string;
    publishableConfigured: boolean;
    webhookConfigured: boolean;
    webhooksUrl: string;
  };
};

const sectionGroupLabels: Record<string, string> = {
  insight: "تقارير",
  moderation: "إشراف",
  money: "مدفوعات",
  leads: "وارد",
  system: "نظام",
};

export function AdminOpsCockpit() {
  const [summary, setSummary] = useState<OpsSummary | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const user = getSessionUser();
      if (!user || user.role !== "admin") return;
      fetch("/api/admin/summary", { headers: { "x-admin-role": "admin" } })
        .then((res) => res.json())
        .then((data) => {
          if (data?.kpis) setSummary(data as OpsSummary);
        })
        .catch(() => setSummary(null));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!summary) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل لوحة التحكم...</p>
      </Card>
    );
  }

  const { kpis, attention, pulse, analytics, sections, stripe, settings } = summary;
  const critical = attention.filter((item) => item.alert && item.count > 0);
  const maxVolume = Math.max(...analytics.daily.map((d) => d.volume), 1);

  return (
    <div className="admin-ops__cockpit">
      <div className="admin-ops__status-row">
        <div
          className={`admin-ops__status-chip${
            stripe.configured ? " admin-ops__status-chip--ok" : " admin-ops__status-chip--warn"
          }`}
        >
          Stripe {stripe.configured ? "متصل" : "غير مُعدّ"} · {stripe.currency.toUpperCase()}
        </div>
        <div className="admin-ops__status-chip">
          رسوم المنصة {settings.platformFeePercent}%
        </div>
        <div
          className={`admin-ops__status-chip${
            settings.maintenanceMode ? " admin-ops__status-chip--warn" : " admin-ops__status-chip--ok"
          }`}
        >
          {settings.maintenanceMode ? "صيانة" : "تشغيل عادي"}
        </div>
        <div className="admin-ops__status-actions">
          <a
            className="admin-ops__ext-link"
            href={stripe.dashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe ↗
          </a>
          <Link className="admin-ops__ext-link" href="/admin/settings">
            الإعدادات
          </Link>
          <Link className="admin-ops__ext-link" href="/admin/audit">
            السجل
          </Link>
        </div>
      </div>

      <div className="admin-ops__kpi-grid admin-ops__kpi-grid--wide">
        <div className="admin-ops__kpi admin-ops__kpi--feature">
          <p className="admin-ops__kpi-label">إجمالي حجم المدفوعات</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.volume} size="lg" />
          </div>
          <p className="admin-ops__kpi-hint">
            {kpis.paidOrders.toLocaleString("ar-AE")} مدفوع · تحويل {kpis.conversionRate}%
          </p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">رسوم المنصة</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.fees} size="md" />
          </div>
          <p className="admin-ops__kpi-hint">إيراد تشغيلي</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">بانتظار المراجعة</p>
          <p className="admin-ops__kpi-value">
            {kpis.pendingListings.toLocaleString("ar-AE")}
          </p>
          <p className="admin-ops__kpi-hint">إعلانات</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">نزاعات مفتوحة</p>
          <p className="admin-ops__kpi-value">
            {kpis.openDisputes.toLocaleString("ar-AE")}
          </p>
          <p className="admin-ops__kpi-hint">تحتاج قرار</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">ضمان محجوز</p>
          <p className="admin-ops__kpi-value">{kpis.heldEscrow.toLocaleString("ar-AE")}</p>
          <p className="admin-ops__kpi-hint">{kpis.refundedOrders} مسترد</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">المستخدمون</p>
          <p className="admin-ops__kpi-value">
            {kpis.totalUsers.toLocaleString("ar-AE")}
          </p>
          <p className="admin-ops__kpi-hint">
            {kpis.totalListings.toLocaleString("ar-AE")} إعلان
          </p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">أرصدة المحافظ</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.walletAvailable} size="md" />
          </div>
          <p className="admin-ops__kpi-hint">
            محجوز <CurrencyAmount amount={kpis.walletHeld} size="sm" />
          </p>
        </div>
      </div>

      <div className="admin-ops__dash-row">
        <section className="admin-ops__panel admin-ops__panel--chart">
          <div className="admin-ops__panel-head">
            <div>
              <h2 className="admin-ops__panel-title">الأداء — 7 أيام</h2>
              <p className="admin-ops__panel-sub">حجم المدفوعات الناجحة يومياً</p>
            </div>
            <Link className="admin-ops__text-link" href="/admin/analytics">
              التحليلات
            </Link>
          </div>
          <div className="admin-ops__bars" role="img" aria-label="مخطط حجم المدفوعات">
            {analytics.daily.map((point) => (
              <div key={point.date} className="admin-ops__bar-col">
                <div className="admin-ops__bar-track">
                  <div
                    className="admin-ops__bar-fill"
                    style={{ height: `${Math.max(8, (point.volume / maxVolume) * 100)}%` }}
                    title={`${point.volume} AED`}
                  />
                </div>
                <p className="admin-ops__bar-value">{point.orders}</p>
                <p className="admin-ops__bar-label">{point.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`admin-ops__panel${critical.length > 0 ? " admin-ops__panel--alert" : ""}`}
        >
          <div className="admin-ops__panel-head">
            <div>
              <h2 className="admin-ops__panel-title">يحتاج قراراً</h2>
              <p className="admin-ops__panel-sub">عناصر عاجلة في الطابور</p>
            </div>
          </div>
          <div className="admin-ops__queue">
            {critical.length === 0 ? (
              <div className="admin-ops__queue-item">
                <p className="admin-ops__queue-meta">لا توجد عناصر عاجلة حالياً.</p>
              </div>
            ) : (
              critical.map((item) => (
                <Link key={item.href} className="admin-ops__queue-item" href={item.href}>
                  <div>
                    <p className="admin-ops__queue-label">{item.label}</p>
                    <p className="admin-ops__queue-meta">{item.meta}</p>
                  </div>
                  <span className="admin-ops__queue-count admin-ops__queue-count--alert">
                    {item.count.toLocaleString("ar-AE")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="admin-ops__panel">
        <div className="admin-ops__panel-head">
          <div>
            <h2 className="admin-ops__panel-title">وحدات التحكم</h2>
            <p className="admin-ops__panel-sub">وصول سريع لكل أقسام التشغيل</p>
          </div>
        </div>
        {(["insight", "moderation", "money", "leads", "system"] as const).map((group) => {
          const items = sections.filter((s) => s.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="admin-ops__map-group">
              <p className="admin-ops__map-label">{sectionGroupLabels[group]}</p>
              <div className="admin-ops__map-grid">
                {items.map((item) => (
                  <Link key={item.href} className="admin-ops__map-card" href={item.href}>
                    <div>
                      <p className="admin-ops__map-title">{item.label}</p>
                      <p className="admin-ops__map-meta">{item.meta}</p>
                    </div>
                    <span className="admin-ops__map-count">
                      {item.count.toLocaleString("ar-AE")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="admin-ops__panels">
        <section className="admin-ops__panel">
          <div className="admin-ops__panel-head">
            <h2 className="admin-ops__panel-title">ملخص الحالات</h2>
            <Link className="admin-ops__text-link" href="/admin/reports">
              التقارير
            </Link>
          </div>
          <div className="admin-ops__detail-grid">
            {analytics.orderStatuses.slice(0, 6).map((slice) => (
              <div key={slice.key} className="admin-ops__detail-row">
                <span>{slice.label}</span>
                <strong>{slice.count.toLocaleString("ar-AE")}</strong>
              </div>
            ))}
          </div>
          <div className="admin-ops__detail-grid" style={{ marginTop: "0.35rem" }}>
            {analytics.paymentStatuses.slice(0, 4).map((slice) => (
              <div key={slice.key} className="admin-ops__detail-row">
                <span>دفع · {slice.label}</span>
                <strong>{slice.count.toLocaleString("ar-AE")}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-ops__panel">
          <div className="admin-ops__panel-head">
            <h2 className="admin-ops__panel-title">نشاط المدفوعات</h2>
            <Link className="admin-ops__text-link" href="/admin/stripe">
              Stripe
            </Link>
          </div>
          <ul className="admin-ops__queue">
            {pulse.length === 0 ? (
              <li className="admin-ops__queue-item">
                <p className="admin-ops__queue-meta">لا أحداث حديثة.</p>
              </li>
            ) : (
              pulse.slice(0, 6).map((item) => (
                <li key={item.id} className="admin-ops__queue-item">
                  <div>
                    <p className="admin-ops__queue-label">{item.text}</p>
                    <p className="admin-ops__queue-meta">
                      {item.time
                        ? new Date(item.time).toLocaleString("ar-AE")
                        : "الآن"}
                      {item.orderId ? ` · ${item.orderId}` : ""}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="admin-ops__quick-links">
            <a
              className="admin-ops__chip-link"
              href={stripe.paymentsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Payments
            </a>
            <a
              className="admin-ops__chip-link"
              href={stripe.webhooksUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Webhooks
            </a>
            <Link className="admin-ops__chip-link" href="/admin/orders">
              الطلبات
            </Link>
            <Link className="admin-ops__chip-link" href="/admin/wallets">
              المحافظ
            </Link>
          </div>
        </section>
      </div>

      <section className="admin-ops__panel">
        <div className="admin-ops__panel-head">
          <h2 className="admin-ops__panel-title">طابور التشغيل</h2>
        </div>
        <div className="admin-ops__queue admin-ops__queue--dense">
          {attention.map((item) => (
            <Link key={item.href} className="admin-ops__queue-item" href={item.href}>
              <div>
                <p className="admin-ops__queue-label">{item.label}</p>
                <p className="admin-ops__queue-meta">{item.meta}</p>
              </div>
              <span
                className={`admin-ops__queue-count${
                  item.alert && item.count > 0 ? " admin-ops__queue-count--alert" : ""
                }`}
              >
                {item.count.toLocaleString("ar-AE")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
