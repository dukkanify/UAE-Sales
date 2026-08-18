"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import type { DisputeWindow } from "@/services/payments/dispute-window";
import { formatRemainingDays } from "@/services/payments/dispute-window";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";

const statusLabels: Record<Order["status"], string> = {
  pending_payment: "بانتظار الدفع",
  paid_held_in_escrow: "محجوز في الضمان",
  delivered: "تم التسليم",
  confirmed: "تم التأكيد",
  released: "تم التحويل",
  disputed: "نزاع",
  refunded: "مسترد",
};

export function OrdersListContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [windows, setWindows] = useState<Record<string, DisputeWindow>>({});
  const [userId] = useState(() => getSessionUser()?.id ?? null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) return;
    fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setWindows(data.disputeWindows ?? {});
      })
      .catch(() => setOrders([]));
  }, []);

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center" variant="flat">
        <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
      </Card>
    );
  }

  return (
    <ul className="grid gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={
              order.status === "disputed"
                ? "/dashboard/disputes"
                : `/orders/${order.id}`
            }
          >
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-primary/30" variant="flat">
              <div>
                <p className="font-semibold text-ink">{order.listingTitle}</p>
                <p className="mt-0.5 text-xs text-muted">{order.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="muted">{statusLabels[order.status]}</Badge>
                {userId &&
                order.buyerId === userId &&
                windows[order.id]?.canOpen ? (
                  <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-[0.65rem] font-bold text-primary">
                    افتح نزاع · متبقي {formatRemainingDays(windows[order.id].remainingDays)}
                  </span>
                ) : null}
                {order.status === "disputed" ? (
                  <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[0.65rem] font-bold text-warning">
                    تابع النزاع
                  </span>
                ) : null}
                <CurrencyAmount amount={order.fees.total} size="sm" />
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
