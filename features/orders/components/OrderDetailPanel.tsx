"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { Order } from "@/types";
import { buildOrderTimeline } from "@/lib/mappers/transaction.mapper";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import {
  confirmOrderReceivedClient,
  markOrderDeliveredClient,
} from "@/services/orders/orders.client";
import { getSessionUser } from "@/services/storage";

type OrderDetailPanelProps = {
  order: Order;
};

const statusLabels: Record<Order["status"], string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  completed: "مكتمل",
  cancelled: "ملغي",
  disputed: "نزاع مفتوح",
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const router = useRouter();
  const sessionUser = getSessionUser();
  const isBuyer = sessionUser?.id === order.buyerId;
  const isSeller = sessionUser?.id === order.sellerId;
  const timeline = buildOrderTimeline(order);

  const { isLoading: confirming, run: handleConfirm } = useAsyncAction(
    useCallback(async () => {
      await confirmOrderReceivedClient(order.id);
      router.refresh();
    }, [order.id, router]),
  );

  const { isLoading: delivering, run: handleDeliver } = useAsyncAction(
    useCallback(async () => {
      await markOrderDeliveredClient(order.id);
      router.refresh();
    }, [order.id, router]),
  );

  return (
    <div className="grid gap-5">
      <Card className="marketplace-panel p-6" variant="flat">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted">رقم الطلب</p>
            <h2 className="mt-1 text-xl font-black text-ink">
              #{order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {new Date(order.createdAt).toLocaleDateString("ar-AE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge variant={order.status === "disputed" ? "muted" : "escrow"}>
            {statusLabels[order.status]}
          </Badge>
        </div>

        <div className="mt-6 flex gap-4">
          {order.listingImageUrl ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-xl)]">
              <AppImage
                alt={order.listingTitle}
                className="object-cover"
                fill
                src={order.listingImageUrl}
              />
            </div>
          ) : null}
          <div>
            <p className="font-bold text-ink">{order.listingTitle}</p>
            <p className="mt-1 text-sm text-muted">
              المشتري: {order.buyerName}
            </p>
            <p className="text-sm text-muted">البائع: {order.sellerName}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">سعر المنتج</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {priceFormatter.format(order.amount)} د.إ
          </p>
        </Card>
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">الرسوم</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {priceFormatter.format(order.paymentFee + order.platformFee)} د.إ
          </p>
        </Card>
        <Card className="p-5" variant="flat">
          <p className="text-xs text-muted">الإجمالي</p>
          <p className="mt-1 text-lg font-bold text-accent">
            {priceFormatter.format(order.totalAmount)} د.إ
          </p>
        </Card>
      </div>

      {order.escrowStatus ? (
        <Card className="marketplace-panel p-6" variant="flat">
          <div className="flex items-center gap-2">
            <Icon className="text-success" name="shield" size={18} />
            <h3 className="text-sm font-semibold text-ink">حالة الضمان المالي</h3>
          </div>
          <p className="mt-2 text-sm text-muted">
            المبلغ المحجوز: {priceFormatter.format(order.escrowAmount ?? order.totalAmount)} د.إ
          </p>
          <Badge className="mt-2" variant="escrow">
            {order.escrowStatus === "held"
              ? "محجوز"
              : order.escrowStatus === "released"
                ? "مُطلق"
                : order.escrowStatus === "disputed"
                  ? "مجمد — نزاع"
                  : "مسترد"}
          </Badge>
        </Card>
      ) : null}

      <Card className="marketplace-panel p-6" variant="flat">
        <h3 className="text-sm font-semibold text-ink">مسار الطلب</h3>
        <ol className="mt-4 grid gap-3">
          {timeline.map((step) => (
            <li
              key={step.id}
              className={`flex gap-3 rounded-[var(--radius-xl)] border px-4 py-3 ${
                step.active
                  ? "border-primary bg-primary/5"
                  : step.completed
                    ? "border-success/30 bg-success-soft/30"
                    : "border-border"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  step.completed
                    ? "bg-success text-white"
                    : step.active
                      ? "bg-primary text-white"
                      : "bg-surface-muted text-muted"
                }`}
              >
                {step.completed ? "✓" : "·"}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{step.label}</p>
                <p className="text-xs text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="marketplace-panel p-6" variant="flat">
        <h3 className="text-sm font-semibold text-ink">الإجراءات</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {isBuyer && order.status === "paid" && order.metadata?.sellerDelivered ? (
            <Button loading={confirming} onClick={handleConfirm} variant="success">
              تأكيد الاستلام
            </Button>
          ) : null}
          {isBuyer && order.status !== "disputed" && order.status !== "cancelled" ? (
            <Button
              href={`/disputes/new?orderId=${order.id}`}
              variant="secondary"
            >
              فتح نزاع
            </Button>
          ) : null}
          {isSeller &&
          order.status === "paid" &&
          !order.metadata?.sellerDelivered ? (
            <Button loading={delivering} onClick={handleDeliver} variant="primary">
              تأكيد التسليم
            </Button>
          ) : null}
          <Button href="/orders" variant="ghost">
            العودة للطلبات
          </Button>
        </div>
      </Card>
    </div>
  );
}
