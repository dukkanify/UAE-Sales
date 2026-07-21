"use client";

import { useEffect, useState } from "react";
import type { QuoteRequest } from "@/types/domain/quote-request";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const statusLabel: Record<QuoteRequest["status"], string> = {
  submitted: "مقدّم",
  quoted: "تم التسعير",
  accepted: "مقبول",
};

const nextStatus: Record<QuoteRequest["status"], QuoteRequest["status"] | null> = {
  submitted: "quoted",
  quoted: "accepted",
  accepted: null,
};

export function AdminQuoteRequestsPanel() {
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/quote-requests", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.quoteRequests ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function patchStatus(id: string, status: QuoteRequest["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/quote-requests/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-role": "admin",
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
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات عروض أسعار.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => {
            const advance = nextStatus[item.status];
            return (
              <li key={item.id} className="admin-ops__queue-item">
                <div>
                  <p className="admin-ops__queue-label">{item.listingTitle}</p>
                  <p className="admin-ops__queue-meta">
                    {item.requesterName} · {item.phone} · {item.serviceRequired}
                  </p>
                  <p className="admin-ops__queue-meta">
                    {item.emirate} / {item.area} · {item.preferredDate} {item.preferredTime}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`admin-ops__status-chip${
                      item.status === "accepted"
                        ? " admin-ops__status-chip--ok"
                        : item.status === "quoted"
                          ? " admin-ops__status-chip--warn"
                          : ""
                    }`}
                  >
                    {statusLabel[item.status]}
                  </span>
                  {advance ? (
                    <Button
                      loading={busyId === item.id}
                      onClick={() => patchStatus(item.id, advance)}
                      size="sm"
                      type="button"
                    >
                      → {statusLabel[advance]}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
