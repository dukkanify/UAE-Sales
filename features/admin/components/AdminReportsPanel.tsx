"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";

type ReportSummary = {
  conversionRate: number;
  openDisputes: number;
  paidOrders: number;
  pendingListings: number;
  refundedOrders: number;
  totalGatewayFees: number;
  totalListings: number;
  totalOrders: number;
  totalPlatformFees: number;
  totalUsers: number;
  totalVolume: number;
};

type PaymentEvent = {
  createdAt: string;
  id: string;
  orderId?: string;
  type: string;
};

type DailyPoint = {
  date: string;
  fees: number;
  label: string;
  orders: number;
  volume: number;
};

export function AdminReportsPanel() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [walletAccounts, setWalletAccounts] = useState(0);
  const [walletBalances, setWalletBalances] = useState({ available: 0, held: 0 });

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/reports", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary ?? null);
        setEvents(data.recentEvents ?? []);
        setDaily(data.daily ?? []);
        setWalletAccounts(data.walletAccounts ?? 0);
        setWalletBalances(data.walletBalances ?? { available: 0, held: 0 });
      })
      .catch(() => undefined);
  }, []);

  if (!summary) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل التقارير...</p>
      </Card>
    );
  }

  const maxVolume = Math.max(...daily.map((d) => d.volume), 1);

  return (
    <div className="grid gap-5">
      <div className="admin-ops__kpi-grid admin-ops__kpi-grid--wide">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">إجمالي الطلبات</p>
          <p className="admin-ops__kpi-value">{summary.totalOrders}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">مدفوعة</p>
          <p className="admin-ops__kpi-value">{summary.paidOrders}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">مستردة</p>
          <p className="admin-ops__kpi-value">{summary.refundedOrders}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">التحويل</p>
          <p className="admin-ops__kpi-value">{summary.conversionRate}%</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">حجم المدفوعات</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={summary.totalVolume} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">رسوم المنصة</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={summary.totalPlatformFees} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">رسوم البوابة</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={summary.totalGatewayFees} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">المحافظ</p>
          <p className="admin-ops__kpi-value">{walletAccounts}</p>
          <p className="admin-ops__kpi-hint">
            متاح <CurrencyAmount amount={walletBalances.available} size="sm" />
          </p>
        </div>
      </div>

      <section className="admin-ops__panel">
        <div className="admin-ops__panel-head">
          <h2 className="admin-ops__panel-title">حجم الأسبوع</h2>
          <Link className="admin-ops__text-link" href="/admin/analytics">
            تحليلات أوسع
          </Link>
        </div>
        <div className="admin-ops__bars" style={{ marginTop: "1rem" }}>
          {daily.map((point) => (
            <div key={point.date} className="admin-ops__bar-col">
              <div className="admin-ops__bar-track">
                <div
                  className="admin-ops__bar-fill"
                  style={{ height: `${Math.max(8, (point.volume / maxVolume) * 100)}%` }}
                />
              </div>
              <p className="admin-ops__bar-value">{point.orders}</p>
              <p className="admin-ops__bar-label">{point.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-ops__panels">
        <section className="admin-ops__panel">
          <h2 className="admin-ops__panel-title">ملخص السوق</h2>
          <div className="admin-ops__detail-grid" style={{ marginTop: "0.85rem" }}>
            <div className="admin-ops__detail-row">
              <span>المستخدمون</span>
              <strong>{summary.totalUsers}</strong>
            </div>
            <div className="admin-ops__detail-row">
              <span>الإعلانات</span>
              <strong>{summary.totalListings}</strong>
            </div>
            <div className="admin-ops__detail-row">
              <span>بانتظار المراجعة</span>
              <strong>{summary.pendingListings}</strong>
            </div>
            <div className="admin-ops__detail-row">
              <span>نزاعات مفتوحة</span>
              <strong>{summary.openDisputes}</strong>
            </div>
            <div className="admin-ops__detail-row">
              <span>محجوز في المحافظ</span>
              <strong>
                <CurrencyAmount amount={walletBalances.held} size="sm" />
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-ops__panel">
          <div className="admin-ops__panel-head">
            <h2 className="admin-ops__panel-title">سجل أحداث الدفع</h2>
            <Link className="admin-ops__text-link" href="/admin/stripe">
              Stripe
            </Link>
          </div>
          <ul className="admin-ops__queue" style={{ marginTop: "0.85rem" }}>
            {events.length === 0 ? (
              <li className="admin-ops__queue-item">
                <p className="admin-ops__queue-meta">لا أحداث بعد.</p>
              </li>
            ) : (
              events.map((event) => (
                <li key={event.id} className="admin-ops__queue-item">
                  <div>
                    <p className="admin-ops__queue-label">{event.type}</p>
                    <p className="admin-ops__queue-meta">
                      {new Date(event.createdAt).toLocaleString("ar-AE")}
                      {event.orderId ? ` — ${event.orderId}` : ""}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
