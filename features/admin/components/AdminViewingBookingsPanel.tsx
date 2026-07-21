"use client";

import { useEffect, useState } from "react";
import type { ViewingBooking } from "@/types/domain/viewing-booking";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const statusLabel: Record<ViewingBooking["status"], string> = {
  confirmed: "مؤكد",
  cancelled: "ملغى",
};

export function AdminViewingBookingsPanel() {
  const [items, setItems] = useState<ViewingBooking[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/viewing-bookings", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.bookings ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function patchStatus(id: string, status: ViewingBooking["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/viewing-bookings/${id}`, {
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
      if (res.ok && data.booking) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.booking : item)),
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
          <p className="text-sm text-muted">لا توجد حجوزات معاينة.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {items.map((item) => (
            <li key={item.id} className="admin-ops__queue-item">
              <div>
                <p className="admin-ops__queue-label">{item.listingTitle}</p>
                <p className="admin-ops__queue-meta">
                  {item.buyerName} · {item.phone} · {item.visitors} زائر
                </p>
                <p className="admin-ops__queue-meta">
                  {item.date} — {item.time}
                  {item.notes ? ` · ${item.notes}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`admin-ops__status-chip${
                    item.status === "confirmed"
                      ? " admin-ops__status-chip--ok"
                      : " admin-ops__status-chip--warn"
                  }`}
                >
                  {statusLabel[item.status]}
                </span>
                {item.status === "confirmed" ? (
                  <Button
                    loading={busyId === item.id}
                    onClick={() => patchStatus(item.id, "cancelled")}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    إلغاء
                  </Button>
                ) : (
                  <Button
                    loading={busyId === item.id}
                    onClick={() => patchStatus(item.id, "confirmed")}
                    size="sm"
                    type="button"
                  >
                    إعادة تأكيد
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
