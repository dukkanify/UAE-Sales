"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AdminDisputeRecord, DisputeStatus } from "@/types";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { Select } from "@/shared/ui/Select";

const statusLabels: Record<DisputeStatus, string> = {
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved_buyer: "لصالح المشتري",
  resolved_seller: "لصالح البائع",
  closed: "مغلق",
};

const filterOptions = [
  { label: "النزاعات المفتوحة", value: "openish" },
  { label: "الكل", value: "all" },
  { label: statusLabels.open, value: "open" },
  { label: statusLabels.under_review, value: "under_review" },
  { label: statusLabels.resolved_buyer, value: "resolved_buyer" },
  { label: statusLabels.resolved_seller, value: "resolved_seller" },
  { label: statusLabels.closed, value: "closed" },
];

function disputeBadgeVariant(
  status: DisputeStatus,
): "pending" | "verified" | "rejected" | "muted" | "escrow" {
  if (status === "open") return "pending";
  if (status === "under_review") return "escrow";
  if (status === "resolved_buyer") return "verified";
  if (status === "resolved_seller") return "muted";
  return "rejected";
}

export function AdminDisputesPanel() {
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("openish");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/disputes", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setDisputes(data.disputes ?? []))
      .catch(() => setDisputes([]));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return disputes;
    if (statusFilter === "openish") {
      return disputes.filter(
        (d) => d.status === "open" || d.status === "under_review",
      );
    }
    return disputes.filter((d) => d.status === statusFilter);
  }, [disputes, statusFilter]);

  async function patchDispute(id: string, status: DisputeStatus, note?: string) {
    const session = getSessionUser();
    if (!session) return;
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/disputes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({
          status,
          resolutionNote: note,
        }),
      });
      const data = await response.json();
      if (response.ok && data.dispute) {
        setDisputes((prev) =>
          prev.map((dispute) => (dispute.id === id ? data.dispute : dispute)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="p-4" variant="flat">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <Select
              label="تصفية النزاعات"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={filterOptions}
              value={statusFilter}
            />
          </div>
          <p className="pb-2 text-xs text-muted">
            <Icon className="ms-1 inline" name="shield" size={14} />
            {filtered.length} نزاع
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد نزاعات مطابقة.</p>
        </Card>
      ) : (
        filtered.map((dispute) => (
          <Card key={dispute.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{dispute.listingTitle}</p>
                <p className="mt-1 text-xs text-muted">{dispute.orderId}</p>
                <p className="mt-2 text-sm">
                  {dispute.buyerName} → {dispute.sellerName}
                </p>
                <p className="mt-2 text-sm text-muted">{dispute.reason}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={disputeBadgeVariant(dispute.status)}>
                    {statusLabels[dispute.status]}
                  </Badge>
                </div>
                {dispute.resolutionNote ? (
                  <p className="mt-2 text-xs text-muted">
                    القرار: {dispute.resolutionNote}
                  </p>
                ) : null}
              </div>
              <div className="text-left">
                <CurrencyAmount amount={dispute.amount} size="lg" />
                <p className="mt-1 text-xs text-muted">
                  {new Date(dispute.createdAt).toLocaleString("ar-AE")}
                </p>
              </div>
            </div>
            {dispute.status === "open" || dispute.status === "under_review" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {dispute.status === "open" ? (
                  <Button
                    loading={busyId === dispute.id}
                    onClick={() => patchDispute(dispute.id, "under_review")}
                    size="sm"
                    variant="secondary"
                  >
                    بدء المراجعة
                  </Button>
                ) : null}
                <Button
                  loading={busyId === dispute.id}
                  onClick={() =>
                    patchDispute(
                      dispute.id,
                      "resolved_buyer",
                      "تم الحكم لصالح المشتري واسترداد المبلغ.",
                    )
                  }
                  size="sm"
                  variant="primary"
                >
                  لصالح المشتري
                </Button>
                <Button
                  loading={busyId === dispute.id}
                  onClick={() =>
                    patchDispute(
                      dispute.id,
                      "resolved_seller",
                      "تم الحكم لصالح البائع وتحرير الضمان.",
                    )
                  }
                  size="sm"
                  variant="secondary"
                >
                  لصالح البائع
                </Button>
                <Button
                  loading={busyId === dispute.id}
                  onClick={() =>
                    patchDispute(dispute.id, "closed", "تم إغلاق النزاع.")
                  }
                  size="sm"
                  variant="ghost"
                >
                  إغلاق
                </Button>
              </div>
            ) : null}
          </Card>
        ))
      )}

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
