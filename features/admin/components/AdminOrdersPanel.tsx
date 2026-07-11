"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/types";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/orders", {
      headers: { "x-admin-role": "admin" },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]));
  }, []);

  async function handleRefund(orderId: string) {
    const user = getSessionUser();
    if (!user) return;
    setRefundingId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        }),
      });
      const data = await response.json();
      if (response.ok && data.order) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? data.order : order)),
        );
      }
    } finally {
      setRefundingId(null);
    }
  }

  return (
    <div className="grid gap-4">
      {orders.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="p-5" variant="flat">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{order.listingTitle}</p>
                <p className="mt-1 text-xs text-muted">{order.id}</p>
                <p className="mt-2 text-sm">
                  {order.buyerName} → {order.sellerName}
                </p>
              </div>
              <div className="text-left">
                <CurrencyAmount amount={order.fees.total} size="lg" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="muted">{order.status}</Badge>
                  <Badge variant="escrow">{order.paymentStatus}</Badge>
                </div>
              </div>
            </div>
            {order.stripePaymentIntentId ? (
              <p className="mt-3 font-mono text-xs text-muted">
                Stripe: {order.stripePaymentIntentId}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={`/orders/${order.id}`} size="sm" variant="secondary">
                عرض
              </Button>
              {order.status !== "refunded" ? (
                <Button
                  loading={refundingId === order.id}
                  onClick={() => handleRefund(order.id)}
                  size="sm"
                  variant="ghost"
                >
                  استرداد
                </Button>
              ) : null}
            </div>
            <ul className="mt-4 grid gap-1 border-t border-border pt-3">
              {order.auditLog.slice(0, 3).map((event) => (
                <li key={event.id} className="text-xs text-muted">
                  {event.message} — {new Date(event.createdAt).toLocaleString("ar-AE")}
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
      <Link className="text-sm font-semibold text-primary" href="/admin">
        ← العودة للإدارة
      </Link>
    </div>
  );
}
