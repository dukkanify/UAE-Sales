"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminEscrowRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { fetchAdminEscrow, patchAdminEscrowClient } from "@/services/admin";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function AdminEscrowPanel() {
  const [items, setItems] = useState<AdminEscrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  const loadEscrow = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminEscrow({ status });
    setItems(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadEscrow();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadEscrow]);

  async function handleAction(id: string, action: "release" | "refund") {
    setActionLoading(true);
    const updated = await patchAdminEscrowClient(id, action);
    if (updated) {
      setItems((list) => list.map((item) => (item.id === id ? updated : item)));
    }
    setActionLoading(false);
  }

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="grid gap-5">
      <Card className="marketplace-panel p-6" variant="flat">
        <div className="flex flex-wrap gap-3">
          {[
            { value: "all", label: "الكل" },
            { value: "held", label: "محجوز" },
            { value: "released", label: "مُطلق" },
            { value: "refunded", label: "مسترد" },
            { value: "disputed", label: "نزاع" },
          ].map((tab) => (
            <Button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              size="sm"
              type="button"
              variant={status === tab.value ? "primary" : "outline"}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              description="لا توجد معاملات ضمان في هذا القسم."
              icon="shield"
              title="لا توجد معاملات"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-[var(--radius-xl)] border border-border/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.listingTitle}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.buyerName} ← {item.sellerName}
                    </p>
                    <p className="mt-2 text-sm font-bold text-primary">
                      {priceFormatter.format(item.amount)} د.إ
                    </p>
                  </div>
                  <AdminStatusBadge status={item.status} />
                </div>

                <div className="mt-4 rounded-[var(--radius-lg)] bg-surface-muted p-3 text-xs text-muted">
                  <p>محجوز: {new Date(item.heldAt).toLocaleString("ar-AE")}</p>
                  {item.releasedAt ? (
                    <p>مُطلق: {new Date(item.releasedAt).toLocaleString("ar-AE")}</p>
                  ) : null}
                  {item.refundedAt ? (
                    <p>مسترد: {new Date(item.refundedAt).toLocaleString("ar-AE")}</p>
                  ) : null}
                </div>

                {item.status === "held" || item.status === "disputed" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      disabled={actionLoading}
                      onClick={() => handleAction(item.id, "release")}
                      size="sm"
                      variant="success"
                    >
                      إطلاق يدوي
                    </Button>
                    <Button
                      disabled={actionLoading}
                      onClick={() => handleAction(item.id, "refund")}
                      size="sm"
                      variant="danger"
                    >
                      استرداد يدوي
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="marketplace-panel p-6" variant="flat">
        <h3 className="text-sm font-semibold text-ink">سجل تدقيق الضمان</h3>
        <ul className="mt-4 grid gap-2 text-sm text-muted">
          {items.slice(0, 5).map((item) => (
            <li key={`audit-${item.id}`} className="rounded-[var(--radius-lg)] border border-border/50 px-3 py-2">
              {item.listingTitle} — {item.status} — {priceFormatter.format(item.amount)} د.إ
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
