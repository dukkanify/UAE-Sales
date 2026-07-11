"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";

type EscrowItem = {
  id: string;
  listingTitle: string;
  amount: number;
  status: string;
  buyer: string;
  createdAt: string;
  stripePaymentIntentId?: string;
};

export function AdminEscrowPanel() {
  const [items, setItems] = useState<EscrowItem[]>([]);
  const [summary, setSummary] = useState({ activeHolds: 0, totalProtected: 0 });

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/escrow", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.orders ?? []);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6" variant="flat">
          <p className="text-sm text-muted">حجوزات نشطة</p>
          <p className="mt-2 text-3xl font-bold text-ink">{summary.activeHolds}</p>
        </Card>
        <Card className="p-6" variant="flat">
          <p className="text-sm text-muted">إجمالي المحمي</p>
          <div className="mt-2">
            <CurrencyAmount amount={summary.totalProtected} size="xl" />
          </div>
        </Card>
      </div>

      <ul className="grid gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4" variant="flat">
              <div>
                <p className="font-semibold text-ink">{item.listingTitle}</p>
                <p className="text-xs text-muted">{item.buyer}</p>
              </div>
              <div className="flex items-center gap-3">
                <CurrencyAmount amount={item.amount} size="sm" />
                <Badge variant="escrow">{item.status}</Badge>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
