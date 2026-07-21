"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { getSessionUser } from "@/services/storage";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

export function AdminEscrowPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState({ activeHolds: 0, totalProtected: 0 });
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const user = getSessionUser();
    if (!user || user.role !== "admin") return;
    fetch("/api/admin/escrow", { headers: { "x-admin-role": "admin" } })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    load();
  }, []);

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
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRefund(orderId: string) {
    const user = getSessionUser();
    if (!user) return;
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
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
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="admin-ops__kpi-grid">
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">حجوزات نشطة</p>
          <p className="admin-ops__kpi-value">{summary.activeHolds}</p>
        </div>
        <div className="admin-ops__kpi">
          <p className="admin-ops__kpi-label">إجمالي المحمي</p>
          <div className="admin-ops__kpi-value">
            <CurrencyAmount amount={summary.totalProtected} size="md" />
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">لا توجد معاملات ضمان.</p>
        </Card>
      ) : (
        <ul className="admin-ops__queue">
          {orders.map((order) => {
            const held =
              order.escrowStatus === "held" ||
              order.status === "paid_held_in_escrow";
            return (
              <li key={order.id} className="admin-ops__queue-item">
                <div>
                  <p className="admin-ops__queue-label">{order.listingTitle}</p>
                  <p className="admin-ops__queue-meta">
                    {order.buyerName} → {order.sellerName} · {order.escrowStatus} ·{" "}
                    {new Date(order.createdAt).toLocaleString("ar-AE")}
                  </p>
                  {order.stripePaymentIntentId ? (
                    <p className="admin-ops__queue-meta font-mono">
                      {order.stripePaymentIntentId}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <CurrencyAmount amount={order.fees.productPrice} size="sm" />
                  {held ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        loading={busyId === order.id}
                        onClick={() => handleRelease(order.id)}
                        size="sm"
                        type="button"
                      >
                        تحرير للبائع
                      </Button>
                      <Button
                        loading={busyId === order.id}
                        onClick={() => handleRefund(order.id)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        استرداد
                      </Button>
                    </div>
                  ) : (
                    <span className="admin-ops__status-chip">{order.status}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="admin-ops__quick-links">
        <Link className="admin-ops__chip-link" href="/admin/orders">
          الطلبات
        </Link>
        <Link className="admin-ops__chip-link" href="/admin/stripe">
          Stripe
        </Link>
        <Link className="admin-ops__text-link" href="/admin">
          غرفة التحكم
        </Link>
      </div>
    </div>
  );
}
