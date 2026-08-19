"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import type { QuoteRequest } from "@/types/domain/quote-request";
import { quoteStatusLabel } from "@/services/activity/activity-labels";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

const ADMIN_ACTIONS: Partial<
  Record<QuoteRequest["status"], { value: QuoteRequest["status"]; label: string }[]>
> = {
  submitted: [
    { value: "quoted", label: "إرسال عرض" },
    { value: "rejected", label: "رفض" },
  ],
  quoted: [
    { value: "accepted", label: "قبول" },
    { value: "rejected", label: "رفض" },
  ],
  accepted: [{ value: "completed", label: "إكمال" }],
  rejected: [{ value: "quoted", label: "إعادة عرض" }],
  completed: [{ value: "accepted", label: "إعادة فتح" }],
};

function statusChipClass(status: QuoteRequest["status"]): string {
  if (status === "accepted" || status === "completed") {
    return " admin-ops__status-chip--ok";
  }
  if (status === "quoted" || status === "rejected") {
    return " admin-ops__status-chip--warn";
  }
  return "";
}

export function AdminQuoteRequestsPanel() {
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/quote-requests")
      .then((res) => res.json())
      .then((data) => setItems(data.quoteRequests ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function patchStatus(id: string, status: QuoteRequest["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await adminFetch(`/api/admin/quote-requests/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status,
          actorId: user.id,
          actorName: user.fullName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.quoteRequest) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.quoteRequest : item)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <LocalizedTree>
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات عروض أسعار.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => {
            const actions = ADMIN_ACTIONS[item.status] ?? [];
            return (
              <li key={item.id} className="admin-ops__queue-item">
                <div>
                  <p className="admin-ops__queue-label">{item.listingTitle}</p>
                  <p className="admin-ops__queue-meta">
                    {item.requesterName} · {item.phone} · {item.serviceRequired}
                  </p>
                  <p className="admin-ops__queue-meta">
                    {item.emirate} / {item.area} · {item.preferredDate}{" "}
                    {item.preferredTime}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`admin-ops__status-chip${statusChipClass(item.status)}`}
                  >
                    {quoteStatusLabel(item.status)}
                  </span>
                  {actions.map((action) => (
                    <Button
                      key={action.value}
                      loading={busyId === item.id}
                      onClick={() => patchStatus(item.id, action.value)}
                      size="sm"
                      type="button"
                      variant={action.value === "rejected" ? "ghost" : "secondary"}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  </LocalizedTree>
  );
}
