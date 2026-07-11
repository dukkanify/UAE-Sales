"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { DeliveryAddress, ShippingMethodId } from "@/types/domain/address";
import type { Listing } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { useToast } from "@/shared/components/ToastProvider";
import { getListingActionConfig } from "@/shared/constants/listingActionConfig";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import { getLocalListingById, getSessionUser } from "@/services/storage";
import {
  calculateShippingFee,
  getAvailableShippingMethods,
  isCategoryShippable,
  validateDeliveryAddress,
} from "@/services/shipping/shipping.service";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { PageHero } from "@/shared/ui/PageHero";
import { AppImage } from "@/shared/components/AppImage";
import { cities } from "@/shared/constants/locations";

type CheckoutWizardProps = {
  catalogListing?: Listing;
  listingRef?: string;
  paymentCancelled?: boolean;
};

type CheckoutStep = "review" | "delivery" | "payment";

const PLATFORM_FEE_RATE = 0.025;
const GATEWAY_FEE_RATE = 0.029;
const GATEWAY_FEE_FIXED = 1;

function calculateTotals(productPrice: number, shippingFee: number) {
  const platformFee = Math.round(productPrice * PLATFORM_FEE_RATE);
  const gatewayFee = Math.round(productPrice * GATEWAY_FEE_RATE + GATEWAY_FEE_FIXED);
  return {
    productPrice,
    shippingFee,
    platformFee,
    gatewayFee,
    total: productPrice + shippingFee + platformFee + gatewayFee,
  };
}

export function CheckoutWizard({
  catalogListing,
  listingRef,
  paymentCancelled,
}: CheckoutWizardProps) {
  const router = useRouter();
  const { showToast } = useToast();
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

  const [step, setStep] = useState<CheckoutStep>("review");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const config = listing ? getListingActionConfig(listing) : null;
  const shippable = listing ? isCategoryShippable(listing.categoryId) : false;
  const user = typeof window !== "undefined" ? getSessionUser() : null;

  const shippingMethods = useMemo(() => {
    if (!listing || !shippable) return [];
    return getAvailableShippingMethods(
      listing.categoryId,
      listing.emirate ?? listing.city,
      user?.city,
    );
  }, [listing, shippable, user?.city]);

  const shippingFee = shippable ? calculateShippingFee(shippingMethod) : 0;
  const totals = listing ? calculateTotals(listing.price, shippingFee) : null;

  async function loadAddresses() {
    if (!user) return;
    const response = await fetch(`/api/addresses?userId=${encodeURIComponent(user.id)}`);
    const data = await response.json();
    setAddresses(data.addresses ?? []);
    const defaultAddress = (data.addresses as DeliveryAddress[] | undefined)?.find(
      (item) => item.isDefault,
    );
    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }

  async function handleContinueFromReview() {
    if (!listing || !config?.checkoutEnabled) {
      setError(LISTING_ERRORS.listingUnavailable);
      return;
    }
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      router.push(
        `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
      return;
    }
    if (isOwnListing(listing, sessionUser)) {
      setError(LISTING_ERRORS.ownListing);
      return;
    }
    if (shippable) {
      await loadAddresses();
      setStep("delivery");
    } else {
      setStep("payment");
    }
  }

  async function handleContinueFromDelivery() {
    if (!shippable) {
      setStep("payment");
      return;
    }
    if (!selectedAddressId && addresses.length === 0) {
      setError(LISTING_ERRORS.invalidAddress);
      return;
    }
    setStep("payment");
  }

  async function handlePay() {
    if (!listing || !totals) return;
    setError("");
    setIsLoading(true);
    try {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyer: {
            id: sessionUser.id,
            email: sessionUser.email,
            fullName: sessionUser.fullName,
            role: sessionUser.role,
          },
          localListing: listing.id.startsWith("local-")
            ? {
                id: listing.id,
                slug: listing.slug,
                title: listing.title,
                price: listing.price,
                categoryId: listing.categoryId,
                emirate: listing.emirate,
                city: listing.city,
                seller: { id: listing.seller.id, name: listing.seller.name },
              }
            : undefined,
          shippingMethod: shippable ? shippingMethod : undefined,
          shippingFee: shippable ? shippingFee : 0,
          addressId: shippable ? selectedAddressId : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(LISTING_ERRORS.paymentFailed);
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
      }
    } catch {
      setError(LISTING_ERRORS.paymentFailed);
    } finally {
      setIsLoading(false);
    }
  }

  if (!listing) {
    return (
      <section className="app-container page-padding">
        <FormMessage variant="error">{LISTING_ERRORS.listingUnavailable}</FormMessage>
      </section>
    );
  }

  const backHref = listing.id.startsWith("local-")
    ? `/listings/local/${listing.id}`
    : `/listings/${listing.slug}`;

  return (
    <section className="app-container page-padding">
      <PageHero
        description="خطوات سريعة وآمنة لإتمام الشراء عبر الضمان المالي."
        eyebrow="الدفع"
        title="إتمام الشراء"
      />

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="mb-6 flex flex-wrap gap-2">
          {(["review", "delivery", "payment"] as CheckoutStep[])
            .filter((item) => item !== "delivery" || shippable)
            .map((item, index) => (
              <Badge key={item} variant={step === item ? "premium" : "muted"}>
                {index + 1}.{" "}
                {item === "review"
                  ? "مراجعة الطلب"
                  : item === "delivery"
                    ? "التوصيل"
                    : "الدفع"}
              </Badge>
            ))}
        </div>

        {paymentCancelled ? (
          <FormMessage variant="error">تم إلغاء الدفع. يمكنك المحاولة مرة أخرى.</FormMessage>
        ) : null}
        {error ? <FormMessage variant="error">{error}</FormMessage> : null}

        {step === "review" ? (
          <Card className="p-6" variant="flat">
            <div className="flex gap-4">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-[var(--radius-xl)]">
                <AppImage
                  alt={listing.title}
                  className="object-cover"
                  fallbackCategory={listing.categoryId}
                  fill
                  sizes="96px"
                  src={listing.imageUrl ?? listing.images?.[0] ?? ""}
                />
              </div>
              <div>
                <h2 className="font-black text-ink">{listing.title}</h2>
                <p className="mt-1 text-sm text-muted">{listing.seller.name}</p>
                <div className="mt-2">
                  <CurrencyAmount amount={listing.price} size="lg" />
                </div>
                {listing.escrowAvailable ? (
                  <Badge className="mt-2" variant="escrow">
                    ضمان مالي
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={handleContinueFromReview} variant="accent">
                متابعة
              </Button>
              <Button href={backHref} variant="secondary">
                إلغاء
              </Button>
            </div>
          </Card>
        ) : null}

        {step === "delivery" && shippable ? (
          <Card className="grid gap-4 p-6" variant="flat">
            <h3 className="font-black text-ink">طريقة التوصيل</h3>
            <div className="grid gap-2">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-xl)] border px-4 py-3 ${shippingMethod === method.id ? "border-secondary bg-secondary-soft" : "border-border"}`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{method.label}</span>
                    <span className="text-xs text-muted">{method.description}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CurrencyAmount amount={method.fee} size="sm" />
                    <input
                      checked={shippingMethod === method.id}
                      name="shipping"
                      onChange={() => setShippingMethod(method.id)}
                      type="radio"
                    />
                  </span>
                </label>
              ))}
            </div>

            <h3 className="font-black text-ink">عنوان التوصيل</h3>
            {addresses.length > 0 ? (
              <Select
                label="عنوان محفوظ"
                name="addressId"
                onChange={(event) => setSelectedAddressId(event.target.value)}
                options={addresses.map((item) => ({
                  label: `${item.label} — ${item.area}`,
                  value: item.id,
                }))}
                value={selectedAddressId}
              />
            ) : (
              <p className="text-sm text-muted">لا توجد عناوين محفوظة. أضف عنواناً جديداً.</p>
            )}

            <AddressQuickForm
              onCreated={async () => {
                await loadAddresses();
                showToast("تم حفظ العنوان");
              }}
              userId={user?.id ?? ""}
            />

            <div className="flex gap-2">
              <Button onClick={handleContinueFromDelivery} variant="accent">
                متابعة للدفع
              </Button>
              <Button onClick={() => setStep("review")} variant="secondary">
                رجوع
              </Button>
            </div>
          </Card>
        ) : null}

        {step === "payment" && totals ? (
          <Card className="grid gap-4 p-6" variant="flat">
            <h3 className="font-black text-ink">ملخص الدفع</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">سعر المنتج</span>
                <CurrencyAmount amount={totals.productPrice} size="sm" />
              </div>
              {shippable ? (
                <div className="flex justify-between">
                  <span className="text-muted">التوصيل</span>
                  <CurrencyAmount amount={totals.shippingFee} size="sm" />
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted">رسوم المنصة</span>
                <CurrencyAmount amount={totals.platformFee} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted">رسوم الدفع</span>
                <CurrencyAmount amount={totals.gatewayFee} size="sm" />
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-bold">الإجمالي</span>
                <CurrencyAmount amount={totals.total} size="lg" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button loading={isLoading} onClick={handlePay} variant="accent">
                تأكيد الدفع عبر Stripe
              </Button>
              <Button
                onClick={() => setStep(shippable ? "delivery" : "review")}
                variant="secondary"
              >
                رجوع
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </section>
  );
}

function AddressQuickForm({
  onCreated,
  userId,
}: {
  onCreated: () => void;
  userId: string;
}) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      userId,
      label: String(form.get("label") ?? "المنزل"),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      emirate: String(form.get("emirate") ?? ""),
      city: String(form.get("city") ?? ""),
      area: String(form.get("area") ?? ""),
      street: String(form.get("street") ?? ""),
      isDefault: true,
    };
    if (!validateDeliveryAddress(payload)) return;
    setIsSaving(true);
    try {
      await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onCreated();
      event.currentTarget.reset();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-3 rounded-[var(--radius-xl)] border border-border p-4" onSubmit={handleSubmit}>
      <p className="text-sm font-semibold text-ink">إضافة عنوان جديد</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="التسمية" name="label" placeholder="المنزل" />
        <Input label="الاسم الكامل" name="fullName" required />
        <Input label="الهاتف" name="phone" required type="tel" />
        <Select
          label="الإمارة"
          name="emirate"
          options={cities.map((city) => ({ label: city.name, value: city.name }))}
        />
        <Input label="المدينة" name="city" required />
        <Input label="المنطقة" name="area" required />
        <Input className="md:col-span-2" label="الشارع / المبنى" name="street" required />
      </div>
      <Button loading={isSaving} size="sm" type="submit" variant="secondary">
        حفظ العنوان
      </Button>
    </form>
  );
}
