"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOrderRecord } from "@/types/domain/admin";
import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { AdminStatusBadge } from "@/features/admin/components/AdminStatusBadge";
import { fetchAdminOrders } from "@/services/admin";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminOrderRecord | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminOrders({ status });
    setOrders(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadOrders();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <Card className="marketplace-panel p-6" variant="flat">
        <select
          className="rounded-[var(--radius-xl)] border border-border bg-surface px-3 py-2.5 text-sm"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="all">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="paid">مدفوع</option>
          <option value="completed">مكتمل</option>
          <option value="cancelled">ملغى</option>
          <option value="disputed">نزاع</option>
        </select>

        {orders.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              description="لا توجد طلبات تطابق الفلتر المحدد."
              icon="package"
              title="لا توجد طلبات"
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead>
                <tr className="border-b border-border text-right text-xs text-muted">
                  <th className="px-3 py-2 font-medium">الطلب</th>
                  <th className="px-3 py-2 font-medium">المشتري / البائع</th>
                  <th className="px-3 py-2 font-medium">المبلغ</th>
                  <th className="px-3 py-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-border/60 transition hover:bg-surface-muted/50"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-xs text-muted">{order.listingTitle}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      <p>{order.buyerName}</p>
                      <p>{order.sellerName}</p>
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {priceFormatter.format(order.totalAmount)} د.إ
                    </td>
                    <td className="px-3 py-3">
                      <AdminStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="marketplace-panel h-fit p-5 lg:sticky lg:top-24" variant="flat">
        <h3 className="text-sm font-semibold text-ink">تفاصيل الطلب</h3>
        {selected ? (
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">رقم الطلب</dt>
              <dd className="font-medium text-ink">{selected.orderNumber}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">الإعلان</dt>
              <dd>{selected.listingTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">المشتري</dt>
              <dd>{selected.buyerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">البائع</dt>
              <dd>{selected.sellerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">ملخص الدفع</dt>
              <dd>
                {priceFormatter.format(selected.amount)} + رسوم ={" "}
                {priceFormatter.format(selected.totalAmount)} د.إ
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">حالة الضمان</dt>
              <dd>
                {selected.escrowStatus ? (
                  <AdminStatusBadge status={selected.escrowStatus} />
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">تاريخ الإنشاء</dt>
              <dd>{new Date(selected.createdAt).toLocaleString("ar-AE")}</dd>
            </div>
            <Button href={`/orders/${selected.id}`} size="sm" variant="secondary">
              عرض في الواجهة
            </Button>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">اختر طلباً لعرض التفاصيل.</p>
        )}
      </Card>
    </div>
  );
}
