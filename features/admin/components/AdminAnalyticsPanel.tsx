"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";

type AnalyticsPayload = {
  daily: {
    date: string;
    fees: number;
    label: string;
    orders: number;
    volume: number;
  }[];
  orderStatuses: { count: number; key: string; label: string }[];
  overview: {
    conversionRate: number;
    currency: string;
    fees: number;
    paidOrders: number;
    recentEvents: number;
    totalListings: number;
    totalOrders: number;
    totalUsers: number;
    volume: number;
    walletAccounts: number;
  };
  paymentStatuses: { count: number; key: string; label: string }[];
  topCategories: { count: number; key: string; label: string }[];
};

export function AdminAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/analytics", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.overview) setData(payload as AnalyticsPayload);
      })
      .catch(() => undefined);
  }, []);

  if (!data) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل التحليلات...</p>
      </Card>
    );
  }

  const maxVolume = Math.max(...data.daily.map((d) => d.volume), 1);

  return (
    <div className="grid gap-5">
      <div className="admin-ops__kpi-grid admin-ops__kpi-grid--wide">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">الحجم الكلي</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={data.overview.volume} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">رسوم المنصة</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={data.overview.fees} size="md" />
          </div>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">التحويل</p>
          <p className="admin-ops__kpi-value">{data.overview.conversionRate}%</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">المستخدمون / الإعلانات</p>
          <p className="admin-ops__kpi-value">
            {data.overview.totalUsers} / {data.overview.totalListings}
          </p>
        </div>
      </div>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">اتجاه 14 يوماً</h2>
        <div className="admin-ops__bars" style={{ marginTop: "1rem" }}>
          {data.daily.map((point) => (
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
          <h2 className="admin-ops__panel-title">حالات الطلبات</h2>
          <div className="admin-ops__detail-grid" style={{ marginTop: "0.85rem" }}>
            {data.orderStatuses.map((slice) => (
              <div key={slice.key} className="admin-ops__detail-row">
                <span>{slice.label}</span>
                <strong>{slice.count}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-ops__panel">
          <h2 className="admin-ops__panel-title">حالات الدفع</h2>
          <div className="admin-ops__detail-grid" style={{ marginTop: "0.85rem" }}>
            {data.paymentStatuses.map((slice) => (
              <div key={slice.key} className="admin-ops__detail-row">
                <span>{slice.label}</span>
                <strong>{slice.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-ops__panel">
        <h2 className="admin-ops__panel-title">أعلى التصنيفات بالإعلانات</h2>
        <div className="admin-ops__detail-grid" style={{ marginTop: "0.85rem" }}>
          {data.topCategories.map((slice) => (
            <div key={slice.key} className="admin-ops__detail-row">
              <span>{slice.label}</span>
              <strong>{slice.count}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link className="admin-ops__chip-link" href="/admin/reports">
          التقارير المالية
        </Link>
        <Link className="admin-ops__chip-link" href="/admin">
          غرفة التحكم
        </Link>
      </div>
    </div>
  );
}
