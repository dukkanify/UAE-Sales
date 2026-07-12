"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { SHIPPING_METHOD_CONFIG } from "@/services/shipping/shipping.config";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { PageHero } from "@/shared/ui/PageHero";

type OrderStatusContentProps = {
  token?: string;
};

const statusLabels: Record<Order["status"], string> = {
  pending_payment: "بانتظار الدفع",
  paid_held_in_escrow: "مدفوع — محجوز في الضمان",
  delivered: "تم التسليم",
  confirmed: "تم التأكيد",
  released: "تم التحويل",
  disputed: "نزاع",
  refunded: "مسترد",
};

export function OrderStatusContent({ token }: OrderStatusContentProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(token ? "" : "رابط متابعة الطلب غير صالح.");

  useEffect(() => {
    if (!token) return;

    fetch(`/api/order-status?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.order) {
          setError("تعذر العثور على الطلب أو انتهت صلاحية الرابط.");
          return;
        }
        setOrder(data.order);
      })
      .catch(() => setError("تعذر تحميل حالة الطلب."));
  }, [token]);

  if (error) {
    return (
      <section className="app-container page-padding">
        <FormMessage variant="error">{error}</FormMessage>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري تحميل حالة الطلب...</p>
        </Card>
      </section>
    );
  }

  const shippingLabel = order.shippingMethod
    ? SHIPPING_METHOD_CONFIG[order.shippingMethod]?.label
    : undefined;

  return (
    <section className="app-container page-padding">
      <PageHero
        description="متابعة آمنة لطلبك دون الحاجة لتسجيل الدخول."
        eyebrow="حالة الطلب"
        title="متابعة الطلب"
      />

      <div className="mx-auto mt-6 max-w-2xl grid gap-5">
        <Card className="p-6" variant="flat">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{statusLabels[order.status]}</Badge>
            <Badge variant="escrow">{order.escrowStatus}</Badge>
            <Badge variant="muted">{order.paymentStatus}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted">رقم الطلب</p>
          <p className="font-mono text-sm font-semibold text-ink">{order.id}</p>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">الإعلان</span>
              <span className="font-semibold">{order.listingTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">البائع</span>
              <span className="font-semibold">{order.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">الإجمالي</span>
              <CurrencyAmount amount={order.fees.total} size="md" />
            </div>
            {shippingLabel ? (
              <div className="flex justify-between">
                <span className="text-muted">التوصيل</span>
                <span className="font-semibold">{shippingLabel}</span>
              </div>
            ) : null}
          </div>
        </Card>

        {order.deliveryAddressSnapshot ? (
          <Card className="p-6" variant="flat">
            <h3 className="text-sm font-semibold text-ink">عنوان التوصيل</h3>
            <p className="mt-2 text-sm text-muted">
              {order.deliveryAddressSnapshot.fullName} — {order.deliveryAddressSnapshot.phone}
            </p>
            <p className="mt-1 text-sm text-muted">
              {order.deliveryAddressSnapshot.area}، {order.deliveryAddressSnapshot.city}،{" "}
              {order.deliveryAddressSnapshot.emirate}
            </p>
            <p className="mt-1 text-sm text-muted">{order.deliveryAddressSnapshot.street}</p>
            {order.deliveryAddressSnapshot.building || order.deliveryAddressSnapshot.unit ? (
              <p className="mt-1 text-sm text-muted">
                {[order.deliveryAddressSnapshot.building, order.deliveryAddressSnapshot.unit]
                  .filter(Boolean)
                  .join(" — ")}
              </p>
            ) : null}
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button href="/login" variant="secondary">
            تسجيل الدخول
          </Button>
          <Button href="/search" variant="ghost">
            متابعة التسوق
          </Button>
        </div>
      </div>
    </section>
  );
}
