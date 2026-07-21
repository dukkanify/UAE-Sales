"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const customerTypeLabels: Record<NonNullable<Order["customerType"]>, string> = {
  registered: "مستخدم مسجّل",
  guest: "ضيف",
  guest_converted: "ضيف — تم تحويله لحساب",
};

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/orders", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => setOrders([]));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRefund(orderId: string) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(orderId);
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
      setBusyId(null);
    }
  }

  async function handleRelease(orderId: string) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/release`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-role": "admin",
        },
        body: JSON.stringify({
          actorId: user.id,
          actorName: user.fullName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) =>
          prev.map((order) => (order.id === orderId ? data.order : order)),
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4">
      {orders.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {orders.map((order) => {
            const held =
              order.escrowStatus === "held" ||
              order.status === "paid_held_in_escrow";
            return (
              <li key={order.id} className="admin-ops__queue-item" style={{ alignItems: "flex-start" }}>
                <div>
                  <p className="admin-ops__queue-label">{order.listingTitle}</p>
                  <p className="admin-ops__queue-meta">{order.id}</p>
                  <p className="admin-ops__queue-meta">
                    {order.buyerName} → {order.sellerName}
                    {order.customerType
                      ? ` · ${customerTypeLabels[order.customerType]}`
                      : ""}
                  </p>
                  {order.stripePaymentIntentId ? (
                    <p className="admin-ops__queue-meta font-mono">
                      Stripe: {order.stripePaymentIntentId}
                    </p>
                  ) : null}
                  <ul className="mt-2 grid gap-1">
                    {order.auditLog.slice(0, 2).map((event) => (
                      <li key={event.id} className="admin-ops__queue-meta">
                        {event.message}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <CurrencyAmount amount={order.fees.total} size="sm" />
                  <span className="admin-ops__status-chip">
                    {order.status} · {order.paymentStatus}
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button href={`/orders/${order.id}`} size="sm" variant="secondary">
                      عرض
                    </Button>
                    {held ? (
                      <Button
                        loading={busyId === order.id}
                        onClick={() => handleRelease(order.id)}
                        size="sm"
                        type="button"
                      >
                        تحرير ضمان
                      </Button>
                    ) : null}
                    {order.status !== "refunded" ? (
                      <Button
                        loading={busyId === order.id}
                        onClick={() => handleRefund(order.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        استرداد
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Link className="admin-ops__text-link" href="/admin">
        غرفة التحكم
      </Link>
    </div>
  );
}
