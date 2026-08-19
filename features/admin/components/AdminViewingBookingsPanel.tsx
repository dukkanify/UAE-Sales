"use client";

import { adminFetch } from "@/features/admin/lib/admin-fetch";
import { useEffect, useState } from "react";
import type { ViewingBooking } from "@/types/domain/viewing-booking";
import { viewingStatusLabel } from "@/services/activity/activity-labels";
import { getSessionUser } from "@/services/storage";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

const ADMIN_ACTIONS: Partial<
  Record<ViewingBooking["status"], { value: ViewingBooking["status"]; label: string }[]>
> = {
  pending: [
    { value: "confirmed", label: "تأكيد" },
    { value: "cancelled", label: "إلغاء" },
  ],
  confirmed: [
    { value: "completed", label: "إكمال" },
    { value: "cancelled", label: "إلغاء" },
  ],
  cancelled: [{ value: "confirmed", label: "إعادة تأكيد" }],
  completed: [{ value: "confirmed", label: "إعادة فتح" }],
};

function statusChipClass(status: ViewingBooking["status"]): string {
  if (status === "confirmed" || status === "completed") {
    return " admin-ops__status-chip--ok";
  }
  if (status === "pending" || status === "cancelled") {
    return " admin-ops__status-chip--warn";
  }
  return "";
}

export function AdminViewingBookingsPanel() {
  const [items, setItems] = useState<ViewingBooking[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    adminFetch("/api/admin/viewing-bookings")
      .then((res) => res.json())
      .then((data) => setItems(data.bookings ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function patchStatus(id: string, status: ViewingBooking["status"]) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(id);
    try {
      const res = await adminFetch(`/api/admin/viewing-bookings/${id}`, {
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
    <LocalizedTree>
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد حجوزات معاينة.</p>
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
                    {item.buyerName} · {item.phone} · {item.visitors} زائر
                  </p>
                  <p className="admin-ops__queue-meta">
                    {item.date} — {item.time}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`admin-ops__status-chip${statusChipClass(item.status)}`}
                  >
                    {viewingStatusLabel(item.status)}
                  </span>
                  {actions.map((action) => (
                    <Button
                      key={action.value}
                      loading={busyId === item.id}
                      onClick={() => patchStatus(item.id, action.value)}
                      size="sm"
                      type="button"
                      variant={action.value === "cancelled" ? "ghost" : "secondary"}
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
