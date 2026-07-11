"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/services/storage";
import { Card } from "@/shared/ui/Card";

type QuoteRequest = {
  id: string;
  listingTitle: string;
  requesterName: string;
  serviceRequired: string;
  createdAt: string;
};

export function AdminQuoteRequestsPanel() {
  const [items, setItems] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/quote-requests", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setItems(data.quoteRequests ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات عروض أسعار.</p>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-4" variant="flat">
            <p className="font-semibold text-ink">{item.listingTitle}</p>
            <p className="mt-1 text-sm text-muted">{item.requesterName}</p>
            <p className="mt-1 text-xs text-muted">{item.serviceRequired}</p>
          </Card>
        ))
      )}
      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
