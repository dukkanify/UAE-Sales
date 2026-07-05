"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Listing, UserProfile } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { createOrderClient } from "@/services/orders/orders.client";
import {
  calculateCheckoutFees,
  MOCK_PAYMENT_METHODS,
} from "@/services/payments";

type CheckoutFormProps = {
  listing: Listing;
  user: UserProfile;
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function CheckoutForm({ listing, user }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const router = useRouter();
  const fees = calculateCheckoutFees(listing.price);

  const { error, isLoading, run: confirmPayment } = useAsyncAction(
    useCallback(async () => {
      const order = await createOrderClient({
        listingId: listing.id,
        amount: listing.price,
        paymentFee: fees.paymentGatewayFee,
        platformFee: fees.platformFee,
        useEscrow: listing.escrowAvailable ?? true,
      });

      router.push(`/orders/${order.id}`);
    }, [fees.paymentGatewayFee, fees.platformFee, listing.escrowAvailable, listing.id, listing.price, router]),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="grid gap-5">
        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">ملخص الإعلان</h2>
          <div className="mt-4 flex gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-[var(--radius-xl)]">
              <AppImage
                alt={listing.title}
                className="object-cover"
                fill
                src={listing.imageUrl ?? listing.images?.[0]}
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-ink">{listing.title}</p>
              <p className="mt-1 text-sm text-muted">
                {listing.area ? `${listing.area}، ` : ""}
                {listing.emirate ?? listing.city}
              </p>
              {listing.escrowAvailable ? (
                <Badge className="mt-2" variant="escrow">
                  محمي بالضمان المالي
                </Badge>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">معلومات البائع</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-primary text-xs font-semibold text-white">
              {listing.seller.name.slice(0, 2)}
            </span>
            <div>
              <p className="font-semibold text-ink">{listing.seller.name}</p>
              <p className="text-xs text-muted">
                تقييم {listing.seller.rating} ·{" "}
                {listing.seller.isVerified ? "بائع موثق" : "بائع"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">معلومات المشتري</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">الاسم</span>
              <span className="font-semibold text-ink">{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">البريد</span>
              <span className="font-semibold text-ink">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">الهاتف</span>
              <span className="font-semibold text-ink">{user.phone}</span>
            </div>
          </div>
        </Card>

        <Card className="marketplace-panel p-6" variant="flat">
          <h2 className="text-sm font-semibold text-ink">طريقة الدفع</h2>
          <div className="mt-4 grid gap-2">
            {MOCK_PAYMENT_METHODS.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3 transition ${
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <input
                  checked={paymentMethod === method.id}
                  className="accent-primary"
                  name="paymentMethod"
                  onChange={() => setPaymentMethod(method.id)}
                  type="radio"
                />
                <Icon name={method.icon} size={18} />
                <div>
                  <p className="text-sm font-semibold text-ink">{method.label}</p>
                  <p className="text-xs text-muted">{method.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:self-start">
        <Card className="marketplace-panel p-6 lg:sticky lg:top-24" variant="flat">
          <h2 className="text-sm font-semibold text-ink">تفاصيل الدفع</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">سعر المنتج</dt>
              <dd className="font-semibold text-ink">
                {priceFormatter.format(fees.productPrice)} د.إ
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">رسوم بوابة الدفع</dt>
              <dd className="font-semibold text-ink">
                {priceFormatter.format(fees.paymentGatewayFee)} د.إ
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">رسوم المنصة</dt>
              <dd className="font-semibold text-ink">
                {priceFormatter.format(fees.platformFee)} د.إ
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3">
              <dt className="font-bold text-ink">الإجمالي</dt>
              <dd className="text-lg font-bold text-accent">
                {priceFormatter.format(fees.totalAmount)} د.إ
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-[var(--radius-xl)] bg-success-soft p-4">
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 text-success" name="shield" size={16} />
              <p className="text-xs font-medium leading-6 text-ink">
                سيتم حجز المبلغ في الضمان المالي حتى تؤكد استلام المنتج. يحمي
                هذا النظام حقوقك وحقوق البائع.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4">
              <FormMessage variant="error">{error}</FormMessage>
            </div>
          ) : null}

          <Button
            className="mt-4"
            fullWidth
            loading={isLoading}
            onClick={confirmPayment}
            size="lg"
            variant="gold"
          >
            تأكيد الدفع
          </Button>
        </Card>
      </div>
    </div>
  );
}
