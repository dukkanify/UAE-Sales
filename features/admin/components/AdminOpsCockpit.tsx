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

type OpsSummary = {
  attention: AttentionItem[];
  kpis: {
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
  };
  pulse: { id: string; text: string; time?: string }[];
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
        <p className="text-sm text-muted">جاري تحميل غرفة العمليات...</p>
      </Card>
    );
  }

  const { kpis, attention, pulse } = summary;
  const critical = attention.filter((item) => item.alert && item.count > 0);

  return (
    <div>
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">بانتظار المراجعة</p>
          <p className="admin-ops__kpi-value">
            {kpis.pendingListings.toLocaleString("ar-AE")}
          </p>
          <p className="admin-ops__kpi-hint">إعلانات تحتاج اعتماد</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">نزاعات مفتوحة</p>
          <p className="admin-ops__kpi-value">
            {kpis.openDisputes.toLocaleString("ar-AE")}
          </p>
          <p className="admin-ops__kpi-hint">حكم إداري مطلوب</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">حجم المدفوعات</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.volume} size="md" />
          </div>
          <p className="admin-ops__kpi-hint">{kpis.paidOrders} طلب مدفوع</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">ضمان محجوز</p>
          <p className="admin-ops__kpi-value">{kpis.heldEscrow.toLocaleString("ar-AE")}</p>
          <p className="admin-ops__kpi-hint">
            {kpis.totalUsers.toLocaleString("ar-AE")} مستخدم ·{" "}
            {kpis.totalListings.toLocaleString("ar-AE")} إعلان
          </p>
        </div>
      </div>

      {critical.length > 0 ? (
        <section className="admin-ops__panel" style={{ marginBottom: "1rem" }}>
          <h2 className="admin-ops__panel-title">عاجل — يحتاج قرارك الآن</h2>
          <div className="admin-ops__queue">
            {critical.map((item) => (
              <Link key={item.href} className="admin-ops__queue-item" href={item.href}>
                <div>
                  <p className="admin-ops__queue-label">{item.label}</p>
                  <p className="admin-ops__queue-meta">{item.meta}</p>
                </div>
                <span className="admin-ops__queue-count admin-ops__queue-count--alert">
                  {item.count.toLocaleString("ar-AE")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="admin-ops__panels">
        <section className="admin-ops__panel">
          <h2 className="admin-ops__panel-title">طابور التشغيل الكامل</h2>
          <div className="admin-ops__queue">
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

        <section className="admin-ops__panel">
          <h2 className="admin-ops__panel-title">نبض المدفوعات</h2>
          <ul className="admin-ops__queue">
            {pulse.length === 0 ? (
              <li className="admin-ops__queue-item">
                <p className="admin-ops__queue-meta">
                  لا أحداث حديثة بعد — النظام جاهز للاستقبال.
                </p>
              </li>
            ) : (
              pulse.map((item) => (
                <li key={item.id} className="admin-ops__queue-item">
                  <div>
                    <p className="admin-ops__queue-label">{item.text}</p>
                    <p className="admin-ops__queue-meta">
                      {item.time
                        ? new Date(item.time).toLocaleString("ar-AE")
                        : "الآن"}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-extrabold text-ink"
              href="/admin/reports"
            >
              التقارير المالية
            </Link>
            <Link
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-extrabold text-ink"
              href="/admin/categories"
            >
              التصنيفات
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
