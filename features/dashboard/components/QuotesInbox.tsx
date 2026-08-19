"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import type { QuoteRequest } from "@/types/domain/quote-request";

const labels: Record<QuoteRequest["status"], string> = {
  submitted: "مقدّم",
  quoted: "تم الرد",
  accepted: "مقبول",
  rejected: "مرفوض",
  expired: "منتهٍ",
  converted: "تحول إلى حجز",
};

export function QuotesInbox() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("id");
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) return;
    fetch(`/api/quote-requests?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => setItems(data.quoteRequests ?? []))
      .catch(() => setItems([]));
  }, []);

  async function patch(id: string, status: QuoteRequest["status"]) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/quote-requests/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.quoteRequest) {
        setItems((prev) => prev.map((item) => (item.id === id ? data.quoteRequest : item)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const user = getSessionUser();
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">لا توجد طلبات خدمة بعد.</p>
      </Card>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          className={`rounded-[var(--radius-xl)] border border-border p-4 ${
            highlight === item.id ? "ring-2 ring-secondary" : ""
          }`}
          key={item.id}
        >
          <p className="text-sm font-bold text-ink">{item.listingTitle}</p>
          <p className="mt-1 text-xs text-muted">
            {item.requesterName} · {item.phone} · {labels[item.status]}
          </p>
          {user?.id === item.providerId && item.status === "submitted" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "quoted")} size="sm" type="button">
                الرد بعرض
              </Button>
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "rejected")} size="sm" type="button" variant="ghost">
                رفض
              </Button>
            </div>
          ) : null}
          {user?.id === item.requesterId && item.status === "quoted" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "accepted")} size="sm" type="button">
                قبول العرض
              </Button>
              <Button loading={busyId === item.id} onClick={() => void patch(item.id, "rejected")} size="sm" type="button" variant="ghost">
                رفض
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
