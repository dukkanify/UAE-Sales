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
    paidOrders: number;
    recentEvents: number;
    refundedOrders: number;
    totalOrders: number;
    volume: number;
  };
  pulse: { id: string; text: string; time?: string }[];
};

export function AdminOpsCockpit() {
  const [summary, setSummary] = useState<OpsSummary | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/summary", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        if (data?.kpis) setSummary(data as OpsSummary);
      })
      .catch(() => setSummary(null));
  }, []);

  if (!summary) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">جاري تحميل غرفة العمليات...</p>
      </Card>
    );
  }

  const { kpis, attention, pulse } = summary;

  return (
    <div>
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">حجم المدفوعات</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.volume} size="md" />
          </div>
          <p className="admin-ops__kpi-hint">{kpis.paidOrders} طلب مدفوع</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">رسوم المنصة</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={kpis.fees} size="md" />
          </div>
          <p className="admin-ops__kpi-hint">صافي تشغيلي</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">ضمان محجوز</p>
          <p className="admin-ops__kpi-value">{kpis.heldEscrow.toLocaleString("ar-AE")}</p>
          <p className="admin-ops__kpi-hint">حالات تحتاج قرار</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">إجمالي الطلبات</p>
          <p className="admin-ops__kpi-value">{kpis.totalOrders.toLocaleString("ar-AE")}</p>
          <p className="admin-ops__kpi-hint">{kpis.refundedOrders} مسترد</p>
        </div>
      </div>

      <div className="admin-ops__panels">
        <section className="admin-ops__panel">
          <h2 className="admin-ops__panel-title">طابور يحتاج قرارك الآن</h2>
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
                <p className="admin-ops__queue-meta">لا أحداث حديثة بعد — النظام جاهز للاستقبال.</p>
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
        </section>
      </div>
    </div>
  );
}
