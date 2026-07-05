"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminSummary } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { formatAdminCurrency } from "@/mock/admin.mock";
import { fetchAdminSummary } from "@/services/admin";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function AdminDashboardPanel() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchAdminSummary()
        .then(setSummary)
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading || !summary) {
    return <AdminLoading />;
  }

  const stats = [
    { label: "إجمالي المستخدمين", value: summary.totalUsers.toLocaleString("ar-AE") },
    { label: "إعلانات نشطة", value: summary.activeListings.toLocaleString("ar-AE") },
    { label: "بانتظار المراجعة", value: summary.pendingListings.toLocaleString("ar-AE") },
    { label: "ضمان محجوز", value: formatAdminCurrency(summary.escrowHeldAmount) },
    { label: "نزاعات مفتوحة", value: summary.openDisputes.toLocaleString("ar-AE") },
    { label: "إجمالي المعاملات", value: summary.totalTransactions.toLocaleString("ar-AE") },
    { label: "إيرادات (تجريبي)", value: formatAdminCurrency(summary.revenueDemo) },
  ];

  const quickActions = [
    { href: "/admin/listings?status=pending_review", label: "مراجعة الإعلانات", icon: "grid" as const },
    { href: "/admin/disputes?status=open", label: "حل النزاعات", icon: "message" as const },
    { href: "/admin/escrow?status=held", label: "إدارة الضمان", icon: "shield" as const },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: "user" as const },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.slice(0, 4).map((stat) => (
          <Card key={stat.label} className="marketplace-stat-card p-6" variant="flat">
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.slice(4).map((stat) => (
          <Card key={stat.label} className="marketplace-stat-card p-5" variant="flat">
            <p className="text-xs font-medium text-muted">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-ink">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">النشاط الأخير</h2>
          <ul className="mt-4 grid gap-3">
            {summary.recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-xl)] border border-border/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{item.text}</p>
                  <p className="mt-1 text-xs text-muted">{item.time}</p>
                </div>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {item.type}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">إجراءات سريعة</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border/70 px-4 py-3 transition hover:border-primary/30 hover:bg-surface-muted"
                href={action.href}
              >
                <span className="grid size-9 place-items-center rounded-[var(--radius-lg)] bg-primary-soft text-primary">
                  <Icon name={action.icon} size={16} />
                </span>
                <span className="text-sm font-medium text-ink">{action.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-5 rounded-[var(--radius-xl)] bg-primary-soft p-4">
            <p className="text-sm font-semibold text-primary">ملخص الإيرادات التجريبي</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {priceFormatter.format(summary.revenueDemo)} د.إ
            </p>
            <Button className="mt-3" href="/admin/reports" size="sm" variant="secondary">
              عرض التقارير
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
