"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";

type ReportSummary = {
  totalOrders: number;
  paidOrders: number;
  refundedOrders: number;
  totalVolume: number;
  totalPlatformFees: number;
};

type PaymentEvent = {
  id: string;
  type: string;
  createdAt: string;
  orderId?: string;
};

export function AdminReportsPanel() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [events, setEvents] = useState<PaymentEvent[]>([]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/reports", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setSummary(data.summary ?? null);
        setEvents(data.recentEvents ?? []);
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

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">إجمالي الطلبات</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.totalOrders}</p>
        </Card>
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">طلبات مدفوعة</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.paidOrders}</p>
        </Card>
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">مستردة</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.refundedOrders}</p>
        </Card>
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">حجم المدفوعات</p>
          <div className="mt-2">
            <CurrencyAmount amount={summary.totalVolume} size="lg" />
          </div>
        </Card>
      </div>

      <Card className="p-6" variant="flat">
        <p className="text-sm text-muted">رسوم المنصة</p>
        <div className="mt-2">
          <CurrencyAmount amount={summary.totalPlatformFees} size="lg" />
        </div>
      </Card>

      <Card className="p-6" variant="flat">
        <h2 className="text-sm font-semibold text-ink">سجل أحداث الدفع</h2>
        <ul className="mt-4 grid gap-2">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-sm"
            >
              <span className="font-semibold text-ink">{event.type}</span>
              {event.orderId ? (
                <span className="text-muted"> — {event.orderId}</span>
              ) : null}
              <p className="text-xs text-muted">
                {new Date(event.createdAt).toLocaleString("ar-AE")}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
