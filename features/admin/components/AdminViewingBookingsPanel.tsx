"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

type ViewingBooking = {
  id: string;
  listingTitle: string;
  buyerName: string;
  date: string;
  time: string;
};

export function AdminViewingBookingsPanel() {
  const [items, setItems] = useState<ViewingBooking[]>([]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/viewing-bookings", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.bookings ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد حجوزات معاينة.</p>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-4" variant="flat">
            <p className="font-semibold text-ink">{item.listingTitle}</p>
            <p className="mt-1 text-sm text-muted">{item.buyerName}</p>
            <p className="mt-1 text-xs text-muted">
              {item.date} — {item.time}
            </p>
          </Card>
        ))
      )}
      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
