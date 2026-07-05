"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminDisputeRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { fetchAdminDisputes, patchAdminDisputeClient } from "@/services/admin";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AdminDisputesPanel() {
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("open");
  const [selected, setSelected] = useState<AdminDisputeRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminDisputes({ status: status === "all" ? undefined : status });
    setDisputes(data);
    if (data[0]) {
      setSelected(data[0]);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDisputes();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadDisputes]);

  async function handleDecision(
    id: string,
    decision: "refund_buyer" | "release_seller" | "partial_refund",
  ) {
    setActionLoading(true);
    const updated = await patchAdminDisputeClient(id, { decision, status: "resolved" });
    if (updated) {
      setDisputes((items) => items.map((item) => (item.id === id ? updated : item)));
      setSelected(updated);
    }
    setActionLoading(false);
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <Card className="marketplace-panel p-6" variant="flat">
        <select
          className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">كل النزاعات</option>
          <option value="open">مفتوحة</option>
          <option value="under_review">قيد المراجعة</option>
          <option value="resolved">محلولة</option>
        </select>

        {disputes.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              description="لا توجد نزاعات في هذا القسم حالياً."
              icon="shield"
              title="لا توجد نزاعات"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {disputes.map((dispute) => (
              <button
                key={dispute.id}
                className={`w-full rounded-[var(--radius-xl)] border p-4 text-right transition ${
                  selected?.id === dispute.id
                    ? "border-primary bg-primary-soft/30"
                    : "border-border/70 hover:bg-surface-muted/50"
                }`}
                onClick={() => setSelected(dispute)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{dispute.listingTitle}</p>
                    <p className="mt-1 text-xs text-muted">{dispute.reason}</p>
                  </div>
                  <AdminStatusBadge status={dispute.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="marketplace-panel h-fit p-5 lg:sticky lg:top-24" variant="flat">
        <h3 className="text-sm font-semibold text-ink">تفاصيل النزاع</h3>
        {selected ? (
          <div className="mt-4 grid gap-4 text-sm">
            <p className="text-muted">{selected.description}</p>

            <div className="rounded-[var(--radius-lg)] bg-surface-muted p-3">
              <p className="text-xs font-semibold text-ink">معاينة الأدلة (تجريبي)</p>
              <p className="mt-1 text-xs text-muted">{selected.evidenceNote ?? "لا توجد أدلة"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-ink">ملاحظة المشتري</p>
              <p className="mt-1 text-xs text-muted">{selected.buyerNote ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">ملاحظة البائع</p>
              <p className="mt-1 text-xs text-muted">{selected.sellerNote ?? "—"}</p>
            </div>

            {selected.status !== "resolved" && selected.status !== "closed" ? (
              <div className="grid gap-2">
                <Button
                  disabled={actionLoading}
                  onClick={() => handleDecision(selected.id, "refund_buyer")}
                  size="sm"
                  variant="primary"
                >
                  استرداد للمشتري
                </Button>
                <Button
                  disabled={actionLoading}
                  onClick={() => handleDecision(selected.id, "release_seller")}
                  size="sm"
                  variant="secondary"
                >
                  إطلاق للبائع
                </Button>
                <Button
                  disabled={actionLoading}
                  onClick={() => handleDecision(selected.id, "partial_refund")}
                  size="sm"
                  variant="ghost"
                >
                  استرداد جزئي
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">اختر نزاعاً لعرض التفاصيل.</p>
        )}
      </Card>
    </div>
  );
}
