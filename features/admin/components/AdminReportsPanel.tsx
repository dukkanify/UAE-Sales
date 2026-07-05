"use client";

import { useEffect, useState } from "react";
import type { AdminReportsData } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminMiniChart } from "@/features/admin/components/AdminMiniChart";
import { formatAdminCurrency } from "@/mock/admin.mock";
import { fetchAdminReports } from "@/services/admin";
import { Card } from "@/shared/ui/Card";

export function AdminReportsPanel() {
  const [reports, setReports] = useState<AdminReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchAdminReports()
        .then(setReports)
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading || !reports) {
    return <AdminLoading />;
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="marketplace-stat-card p-6" variant="flat">
          <p className="text-sm font-medium text-muted">الإيرادات (تجريبي)</p>
          <p className="mt-2 text-2xl font-bold text-ink">
            {formatAdminCurrency(reports.revenueDemo)}
          </p>
        </Card>
        <Card className="marketplace-stat-card p-6" variant="flat">
          <p className="text-sm font-medium text-muted">معدل النزاعات</p>
          <p className="mt-2 text-2xl font-bold text-ink">{reports.disputeRate}%</p>
        </Card>
        <Card className="marketplace-stat-card p-6" variant="flat">
          <p className="text-sm font-medium text-muted">ضمان محجوز</p>
          <p className="mt-2 text-2xl font-bold text-ink">
            {formatAdminCurrency(reports.escrowSummary.held)}
          </p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="marketplace-panel p-6" variant="flat">
          <AdminMiniChart
            color="var(--color-primary)"
            data={reports.listingsGrowth}
            title="نمو الإعلانات"
          />
        </Card>
        <Card className="marketplace-panel p-6" variant="flat">
          <AdminMiniChart
            color="var(--color-secondary)"
            data={reports.usersGrowth}
            title="نمو المستخدمين"
          />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="marketplace-panel p-6" variant="flat">
          <AdminMiniChart
            color="var(--color-success)"
            data={reports.transactionsSummary}
            title="ملخص المعاملات"
          />
        </Card>
        <Card className="marketplace-panel p-6" variant="flat">
          <h3 className="text-sm font-semibold text-ink">ملخص الضمان</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">محجوز</dt>
              <dd className="font-medium">{formatAdminCurrency(reports.escrowSummary.held)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">مُطلق</dt>
              <dd className="font-medium">{formatAdminCurrency(reports.escrowSummary.released)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">مسترد</dt>
              <dd className="font-medium">{formatAdminCurrency(reports.escrowSummary.refunded)}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
