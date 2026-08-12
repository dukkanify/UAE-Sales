"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryAddress } from "@/types/domain/address";
import type { Order } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { SHIPPING_METHOD_CONFIG } from "@/services/shipping/shipping.config";
import { getSessionSnapshot } from "@/services/storage/external-store";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { PageHero } from "@/shared/ui/PageHero";

type CheckoutSuccessContentProps = {
  orderId?: string;
  guestToken?: string;
  sessionId?: string;
};

const statusLabels: Record<Order["status"], string> = {
  pending_payment: "بانتظار تأكيد الدفع",
  paid_held_in_escrow: "مدفوع — محجوز في الضمان",
  delivered: "تم التسليم",
  confirmed: "تم التأكيد",
  released: "تم التحويل",
  disputed: "نزاع",
  refunded: "مسترد",
};

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 1500;

export function CheckoutSuccessContent({
  orderId: initialOrderId,
  guestToken,
  sessionId,
}: CheckoutSuccessContentProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [error, setError] = useState("");
  const [pollingDelayed, setPollingDelayed] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const orderIdRef = useRef(initialOrderId ?? "");
  const sessionUser = getSessionSnapshot();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (sessionId && attemptsRef.current === 0) {
          const confirmRes = await fetch(
            `/api/checkout/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
          );
          if (confirmRes.ok) {
            const confirmData = await confirmRes.json();
            if (confirmData.order?.id) {
              orderIdRef.current = confirmData.order.id as string;
            }
          }
        }

        const orderId = orderIdRef.current;
        if (!orderId && !guestToken) {
          setError("لم يتم العثور على رقم الطلب.");
          return;
        }

        const url = guestToken
          ? `/api/order-status?token=${encodeURIComponent(guestToken)}`
          : `/api/orders/${orderId}`;
        const response = await fetch(url);
        const data = await response.json();
        if (cancelled) return;

        if (!data.order) {
          if (attemptsRef.current < MAX_POLL_ATTEMPTS) {
            attemptsRef.current += 1;
            timeoutRef.current = window.setTimeout(load, POLL_INTERVAL_MS);
            return;
          }
          setError("لم يتم العثور على الطلب.");
          return;
        }

        setOrder(data.order);
        orderIdRef.current = data.order.id;
        setHasExistingAccount(Boolean(data.order.hasExistingAccount));

        if (data.order.deliveryAddressSnapshot) {
          setAddress({
            id: "",
            userId: "",
            label: data.order.deliveryAddressSnapshot.label ?? "التوصيل",
            fullName: data.order.deliveryAddressSnapshot.fullName,
            phone: data.order.deliveryAddressSnapshot.phone,
            emirate: data.order.deliveryAddressSnapshot.emirate,
            city: data.order.deliveryAddressSnapshot.city,
            area: data.order.deliveryAddressSnapshot.area,
            street: data.order.deliveryAddressSnapshot.street,
            building: data.order.deliveryAddressSnapshot.building,
            unit: data.order.deliveryAddressSnapshot.unit,
            landmark: data.order.deliveryAddressSnapshot.landmark,
            notes: data.order.deliveryAddressSnapshot.notes,
            isDefault: false,
            createdAt: "",
            updatedAt: "",
          });
        } else if (data.order.deliveryAddressId && data.order.buyerId) {
          const addressResponse = await fetch(
            `/api/addresses?userId=${encodeURIComponent(data.order.buyerId)}`,
          );
          const addressData = await addressResponse.json();
          const match = (
            addressData.addresses as DeliveryAddress[] | undefined
          )?.find((item) => item.id === data.order.deliveryAddressId);
          if (match) setAddress(match);
        }

        if (
          data.order.status === "pending_payment" &&
          attemptsRef.current < MAX_POLL_ATTEMPTS
        ) {
          attemptsRef.current += 1;
          timeoutRef.current = window.setTimeout(load, POLL_INTERVAL_MS);
          return;
        }

        if (data.order.status === "pending_payment") {
          setPollingDelayed(true);
        }
      } catch {
        if (!cancelled) setError("تعذر تحميل تفاصيل الطلب.");
      }
    };

    load();

    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [guestToken, sessionId]);

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
          <p className="text-sm text-muted">جاري تأكيد الدفع مع Stripe...</p>
        </Card>
      </section>
    );
  }

  const shippingLabel = order.shippingMethod
    ? SHIPPING_METHOD_CONFIG[order.shippingMethod]?.label
    : undefined;
  const estimatedDelivery = order.shippingMethod
    ? SHIPPING_METHOD_CONFIG[order.shippingMethod]?.estimatedLabel
    : undefined;
  const trackHref = guestToken
    ? `/order-status?token=${encodeURIComponent(guestToken)}`
    : `/orders/${order.id}`;
  const isPending = order.status === "pending_payment";

  return (
    <section className="app-container page-padding">
      <PageHero
        description={
          isPending
            ? "استلمنا عودتك من Stripe. ننتظر تأكيد الدفع النهائي."
            : "شكراً لك. تم استلام طلبك بنجاح."
        }
        eyebrow="تأكيد الطلب"
        title={isPending ? "بانتظار تأكيد الدفع" : "تم إتمام الشراء"}
      />

      <div className="mx-auto mt-6 max-w-2xl grid gap-5">
        {isPending || pollingDelayed ? (
          <FormMessage variant="error">
            الدفع قيد التأكيد. إن خصم المبلغ من بطاقتك، حدّث الصفحة خلال دقيقة أو
            راجع صفحة الطلب. إن استمر التأخير تواصل مع الدعم وأرفق رقم الطلب.
          </FormMessage>
        ) : (
          <FormMessage variant="success">
            تم الدفع بنجاح. المبلغ محجوز في الضمان حتى تأكيد الاستلام.
          </FormMessage>
        )}

        {hasExistingAccount && !sessionUser ? (
          <FormMessage variant="success">
            لديك حساب سابق بهذا البريد. يمكنك تسجيل الدخول لمتابعة جميع طلباتك.
          </FormMessage>
        ) : null}

        <Card className="p-6" variant="flat">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{statusLabels[order.status]}</Badge>
            <Badge variant="escrow">{order.escrowStatus}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted">رقم الطلب</p>
          <p className="font-mono text-sm font-semibold text-ink">{order.id}</p>
          <p className="mt-2 text-sm text-muted">البريد: {order.buyerEmail}</p>

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
            {estimatedDelivery ? (
              <div className="flex justify-between">
                <span className="text-muted">التسليم المتوقع</span>
                <span className="font-semibold">{estimatedDelivery}</span>
              </div>
            ) : null}
          </div>
        </Card>

        {address ? (
          <Card className="p-6" variant="flat">
            <h3 className="text-sm font-semibold text-ink">عنوان التوصيل</h3>
            <p className="mt-2 text-sm text-muted">
              {address.fullName} — {address.phone}
            </p>
            <p className="mt-1 text-sm text-muted">
              {address.area}، {address.city}، {address.emirate}
            </p>
            <p className="mt-1 text-sm text-muted">{address.street}</p>
          </Card>
        ) : null}

        <Card className="p-6" variant="flat">
          <h3 className="text-sm font-semibold text-ink">الخطوات التالية</h3>
          <ol className="mt-3 grid gap-2 text-sm text-muted">
            <li>1. سيتواصل البائع معك لتنسيق التسليم.</li>
            <li>2. بعد استلام المنتج، أكّد الاستلام من صفحة الطلب.</li>
            <li>3. يُحوّل المبلغ للبائع بعد التأكيد.</li>
          </ol>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button href={trackHref} variant="accent">
            متابعة الطلب
          </Button>
          {!sessionUser ? (
            <Button href="/complete-account" variant="secondary">
              إنشاء كلمة مرور لحسابي
            </Button>
          ) : null}
          <Button href="/search" variant="ghost">
            متابعة التسوق
          </Button>
        </div>
      </div>
    </section>
  );
}
