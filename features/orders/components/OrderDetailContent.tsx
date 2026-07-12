"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { PageHero } from "@/shared/ui/PageHero";

type OrderDetailContentProps = {
  orderId: string;
  paymentSuccess?: boolean;
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

export function OrderDetailContent({
  orderId,
  paymentSuccess,
}: OrderDetailContentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          router.push(`/login?next=/orders/${orderId}`);
          return null;
        }
        if (res.status === 403) {
          setError("ليس لديك صلاحية لعرض هذا الطلب.");
          return null;
        }
        if (!data.order) {
          setError("لم يتم العثور على الطلب.");
          return null;
        }
        return data.order as Order;
      })
      .then((loaded) => {
        if (loaded) setOrder(loaded);
      })
      .catch(() => setError("تعذر تحميل الطلب."));
  }, [orderId, router]);

  async function handleConfirmReceived() {
    const { getSessionUser } = await import("@/services/storage");
    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=/orders/${orderId}`);
      return;
    }

    setIsConfirming(true);
    setConfirmMessage("");
    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError("تعذر تأكيد الاستلام.");
        return;
      }
      setOrder(data.order);
      setConfirmMessage("تم تأكيد الاستلام وتحويل المبلغ للبائع.");
    } catch {
      setError("تعذر تأكيد الاستلام.");
    } finally {
      setIsConfirming(false);
    }
  }

  if (!order && !error) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm text-muted">جاري تحميل الطلب...</p>
        </Card>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="app-container page-padding">
        <FormMessage variant="error">{error || "لم يتم العثور على الطلب."}</FormMessage>
      </section>
    );
  }

  const canConfirm =
    order.status === "paid_held_in_escrow" ||
    order.status === "delivered";

  return (
    <section className="app-container page-padding">
      <PageHero
        description={`طلب رقم ${order.id}`}
        eyebrow="الطلبات"
        title={order.listingTitle}
      />

      <div className="mx-auto mt-6 max-w-2xl grid gap-5">
        {paymentSuccess ? (
          <FormMessage variant="success">تم الدفع بنجاح. المبلغ محجوز في الضمان.</FormMessage>
        ) : null}
        {confirmMessage ? (
          <FormMessage variant="success">{confirmMessage}</FormMessage>
        ) : null}
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <Card className="p-6" variant="flat">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{statusLabels[order.status]}</Badge>
            <Badge variant="escrow">{order.escrowStatus}</Badge>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">البائع</span>
              <span className="font-semibold">{order.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">المشتري</span>
              <span className="font-semibold">{order.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">الإجمالي</span>
              <CurrencyAmount amount={order.fees.total} size="md" />
            </div>
            {order.fees.shippingFee > 0 ? (
              <div className="flex justify-between">
                <span className="text-muted">التوصيل</span>
                <CurrencyAmount amount={order.fees.shippingFee} size="sm" />
              </div>
            ) : null}
            {order.shippingMethod ? (
              <div className="flex justify-between">
                <span className="text-muted">طريقة التوصيل</span>
                <span className="font-semibold">{order.shippingMethod}</span>
              </div>
            ) : null}
            {order.stripePaymentIntentId ? (
              <div className="flex justify-between">
                <span className="text-muted">Stripe Payment</span>
                <span className="font-mono text-xs">{order.stripePaymentIntentId}</span>
              </div>
            ) : null}
          </div>
        </Card>

        {canConfirm ? (
          <Button
            loading={isConfirming}
            onClick={handleConfirmReceived}
            size="lg"
            variant="accent"
          >
            تأكيد الاستلام
          </Button>
        ) : null}

        <Card className="p-6" variant="flat">
          <h3 className="text-sm font-semibold text-ink">سجل الطلب</h3>
          <ul className="mt-4 grid gap-2">
            {order.auditLog.map((event) => (
              <li
                key={event.id}
                className="rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-sm"
              >
                <p className="font-semibold text-ink">{event.message}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {new Date(event.createdAt).toLocaleString("ar-AE")}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}
