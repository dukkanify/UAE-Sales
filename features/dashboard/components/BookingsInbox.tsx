"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import type { ViewingBooking } from "@/types/domain/viewing-booking";

const labels: Record<ViewingBooking["status"], string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  rescheduled: "تم تغيير الموعد",
  cancelled: "ملغى",
  completed: "مكتمل",
};

export function BookingsInbox() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("id");
  const [items, setItems] = useState<ViewingBooking[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load(userId: string) {
    fetch(`/api/viewing-bookings?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => setItems(data.bookings ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    const user = getSessionUser();
    if (user) load(user.id);
  }, []);

  async function patch(id: string, status: ViewingBooking["status"]) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/viewing-bookings/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setItems((prev) => prev.map((item) => (item.id === id ? data.booking : item)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const user = getSessionUser();

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">لا توجد حجوزات معاينة بعد.</p>
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
            {item.buyerName} · {item.phone} · {item.visitors} زائر
          </p>
          <p className="mt-1 text-xs text-muted">
            {item.date} — {item.time} · {labels[item.status] ?? item.status}
          </p>
          {user?.id === item.sellerId && item.status === "pending" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                loading={busyId === item.id}
                onClick={() => void patch(item.id, "confirmed")}
                size="sm"
                type="button"
              >
                تأكيد الموعد
              </Button>
              <Button
                loading={busyId === item.id}
                onClick={() => void patch(item.id, "cancelled")}
                size="sm"
                type="button"
                variant="ghost"
              >
                إلغاء
              </Button>
            </div>
          ) : null}
          {user?.id === item.sellerId &&
          (item.status === "confirmed" || item.status === "rescheduled") ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                loading={busyId === item.id}
                onClick={() => void patch(item.id, "completed")}
                size="sm"
                type="button"
              >
                اكتمال المعاينة
              </Button>
              <Button
                loading={busyId === item.id}
                onClick={() => void patch(item.id, "cancelled")}
                size="sm"
                type="button"
                variant="ghost"
              >
                إلغاء
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
