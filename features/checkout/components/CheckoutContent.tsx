"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Listing } from "@/types";
import { getLocalListingById, getSessionUser } from "@/services/storage";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { PageHero } from "@/shared/ui/PageHero";

type CheckoutContentProps = {
  catalogListing?: Listing;
  listingRef?: string;
  paymentCancelled?: boolean;
};

const PLATFORM_FEE_RATE = 0.025;
const GATEWAY_FEE_RATE = 0.029;
const GATEWAY_FEE_FIXED = 1;

function calculateFees(price: number) {
  const productPrice = Math.max(0, Math.round(price));
  const platformFee = Math.round(productPrice * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(productPrice * GATEWAY_FEE_RATE + GATEWAY_FEE_FIXED);
  return {
    productPrice,
    platformFee,
    gatewayFee,
    total: productPrice + platformFee + gatewayFee,
  };
}

export function CheckoutContent({
  catalogListing,
  listingRef,
  paymentCancelled,
}: CheckoutContentProps) {
  const router = useRouter();
  const listing = useSyncExternalStore(
    () => () => undefined,
    () => {
      if (listingRef?.startsWith("local-")) {
        return getLocalListingById(listingRef) ?? catalogListing;
      }
      return catalogListing;
    },
    () => catalogListing,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fees = listing ? calculateFees(listing.price) : null;

  const backHref = listing
    ? listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`
    : "/search";

  async function handleConfirmPayment() {
    setError("");
    const user = getSessionUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!listing) {
      setError("تعذر العثور على الإعلان.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyer: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          localListing: listing.id.startsWith("local-")
            ? {
                id: listing.id,
                slug: listing.slug,
                title: listing.title,
                price: listing.price,
                seller: {
                  id: listing.seller.id,
                  name: listing.seller.name,
                },
              }
            : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error === "CANNOT_BUY_OWN_LISTING"
            ? "لا يمكنك شراء إعلانك الخاص."
            : "تعذر بدء الدفع. حاول مرة أخرى.",
        );
        return;
      }

      if (data.mode === "mock" && data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }

      setError("تعذر بدء الدفع.");
    } catch {
      setError("تعذر الاتصال بخادم الدفع.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!listing) {
    return (
      <section className="app-container page-padding">
        <PageHero
          description="لم نتمكن من العثور على الإعلان المطلوب."
          eyebrow="الدفع"
          title="إتمام الشراء"
        />
        <Button href="/search">تصفح الإعلانات</Button>
      </section>
    );
  }

  return (
    <section className="app-container page-padding">
      <PageHero
        description={
          showsEscrowProtection(listing)
            ? "راجع التفاصيل وأكّد الدفع عبر Stripe. المبلغ يُحجز في الضمان حتى تأكيد الاستلام."
            : "راجع التفاصيل وأكّد الدفع عبر نظام الدفع المدمج في المنصة."
        }
        eyebrow="الدفع"
        title="إتمام الشراء"
      />

      <div className="mx-auto mt-6 max-w-2xl grid gap-5">
        {paymentCancelled ? (
          <FormMessage variant="error">تم إلغاء الدفع. يمكنك المحاولة مرة أخرى.</FormMessage>
        ) : null}

        <Card className="p-6" variant="flat">
          {showsEscrowProtection(listing) ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
              <Badge variant="verified">محمي بالضمان</Badge>
            </div>
          ) : null}
          <h2 className="mt-4 text-xl font-black text-ink">{listing.title}</h2>
          <p className="mt-2 text-sm text-muted">
            البائع: {listing.seller.name}
          </p>
        </Card>

        {fees ? (
          <Card className="p-6" variant="flat">
            <h3 className="text-sm font-semibold text-ink">تفاصيل الدفع</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">سعر المنتج</span>
                <CurrencyAmount amount={fees.productPrice} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted">رسوم بوابة الدفع</span>
                <CurrencyAmount amount={fees.gatewayFee} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted">رسوم المنصة</span>
                <CurrencyAmount amount={fees.platformFee} size="sm" />
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-bold text-ink">الإجمالي</span>
                <CurrencyAmount amount={fees.total} size="lg" />
              </div>
            </div>
          </Card>
        ) : null}

        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        <div className="flex flex-wrap gap-3">
          <Button loading={isLoading} onClick={handleConfirmPayment} size="lg" variant="accent">
            تأكيد الدفع
          </Button>
          <Button href={backHref} size="lg" variant="secondary">
            العودة للإعلان
          </Button>
        </div>
      </div>
    </section>
  );
}
