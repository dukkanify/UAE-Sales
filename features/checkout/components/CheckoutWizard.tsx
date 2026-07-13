"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { DeliveryAddress, ShippingMethodId } from "@/types/domain/address";
import type { Listing } from "@/types";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { isGuestCheckoutEnabled, isMockCheckoutEnabled } from "@/shared/constants/feature-flags";
import {
  CHECKOUT_ERRORS,
  buildDeliveryAddressInput,
  formatSavedAddressLine,
  normalizeGuestBuyer,
  validateCheckoutReviewStep,
  validateGuestDeliveryStep,
  type GuestDeliveryInfo,
} from "@/features/checkout/utils/checkout-validation";
import { getLocalListingById } from "@/services/storage";
import { getSessionSnapshot, subscribeSession } from "@/services/storage/external-store";
import {
  calculateShippingFee,
  getAvailableShippingMethods,
  isCategoryShippable,
} from "@/services/shipping/shipping.service";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
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

const CHECKOUT_API_ERRORS: Record<string, string> = {
  INVALID_INPUT: "بيانات الطلب غير مكتملة. راجع خطوة التوصيل.",
  LISTING_NOT_FOUND: "الإعلان غير موجود.",
  CANNOT_BUY_OWN_LISTING: "لا يمكنك شراء إعلانك الخاص.",
  SHIPPING_UNAVAILABLE: "التوصيل غير متاح لهذا الطلب.",
};

function formatCheckoutApiError(data: unknown): string {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return LISTING_ERRORS.paymentFailed;
  }
  const code = String((data as { error: unknown }).error);
  return CHECKOUT_API_ERRORS[code] ?? `${LISTING_ERRORS.paymentFailed} (${code})`;
}

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

const defaultGuestInfo: GuestDeliveryInfo = {
  fullName: "",
  email: "",
  phone: "",
  shippingMethod: "standard",
  emirate: "دبي",
  addressLine: "",
  saveAddress: false,
};

export function CheckoutWizard({
  catalogListing,
  listingRef,
  paymentCancelled,
}: CheckoutWizardProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const transitionLockRef = useRef(false);
  const guestCheckout = isGuestCheckoutEnabled();

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

  const sessionUser = useSyncExternalStore(
    subscribeSession,
    () => getSessionSnapshot(),
    () => null,
  );

  const [step, setStep] = useState<CheckoutStep>("review");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [guestInfo, setGuestInfo] = useState<GuestDeliveryInfo>(defaultGuestInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [error, setError] = useState("");
  const [existingAccountHint, setExistingAccountHint] = useState(false);

  const shippable = listing ? isCategoryShippable(listing.categoryId) : false;
  const requiresAddress = shippable && shippingMethod !== "pickup";

  const shippingMethods = useMemo(() => {
    if (!listing || !shippable) return [];
    const buyerEmirate = sessionUser?.city ?? guestInfo.emirate;
    return getAvailableShippingMethods(
      listing.categoryId,
      listing.emirate ?? listing.city,
      buyerEmirate,
    );
  }, [listing, shippable, sessionUser?.city, guestInfo.emirate]);

  const shippingFee = shippable ? calculateShippingFee(shippingMethod) : 0;
  const totals = listing ? calculateTotals(listing.price, shippingFee) : null;

  function scrollPanelToTop() {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function advanceStep(next: CheckoutStep) {
    setStep(next);
    setError("");
    scrollPanelToTop();
  }

  function prefillGuestFromSession() {
    if (!sessionUser) return;
    setGuestInfo((prev) => ({
      ...prev,
      fullName: prev.fullName || sessionUser.fullName,
      email: prev.email || sessionUser.email,
      phone: prev.phone || sessionUser.phone,
      emirate: prev.emirate || sessionUser.city || "دبي",
    }));
  }

  async function loadAddresses(userId: string) {
    const response = await fetch(`/api/addresses?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
      throw new Error("ADDRESS_LOAD_FAILED");
    }
    const data = await response.json();
    setAddresses(data.addresses ?? []);
    const defaultAddress = (data.addresses as DeliveryAddress[] | undefined)?.find(
      (item) => item.isDefault,
    );
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setGuestInfo((prev) => ({
        ...prev,
        fullName: defaultAddress.fullName,
        phone: defaultAddress.phone,
        emirate: defaultAddress.emirate,
        addressLine: formatSavedAddressLine(defaultAddress),
      }));
    }
  }

  async function checkEmailExists(email: string) {
    if (!guestCheckout || sessionUser) return;
    try {
      const response = await fetch("/api/checkout/lookup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (response.ok) {
        const data = await response.json();
        setExistingAccountHint(Boolean(data.hasAccount));
      }
    } catch {
      setExistingAccountHint(false);
    }
  }

  async function handleContinueFromReview() {
    if (transitionLockRef.current || isContinuing) return;

    setError("");
    const buyer = getSessionSnapshot();
    const validation = validateCheckoutReviewStep(listing, buyer);

    if (!validation.ok) {
      if (validation.redirectToLogin) {
        router.push(
          `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
        return;
      }
      setError(validation.message);
      return;
    }

    transitionLockRef.current = true;
    setIsContinuing(true);

    try {
      prefillGuestFromSession();
      if (shippable) {
        if (buyer) await loadAddresses(buyer.id);
        advanceStep("delivery");
      } else {
        if (guestCheckout && !buyer) {
          advanceStep("delivery");
        } else {
          advanceStep("payment");
        }
      }
    } catch {
      setError(CHECKOUT_ERRORS.addressLoadFailed);
    } finally {
      setIsContinuing(false);
      transitionLockRef.current = false;
    }
  }

  async function handleContinueFromDelivery() {
    if (transitionLockRef.current || isContinuing) return;

    setError("");
    const buyer = getSessionSnapshot();
    const deliveryInfo: GuestDeliveryInfo = {
      ...guestInfo,
      ...normalizeGuestBuyer(guestInfo),
      shippingMethod,
    };

    if (buyer && shippable && requiresAddress && addresses.length > 0) {
      if (!selectedAddressId) {
        setError(CHECKOUT_ERRORS.savedAddressRequired);
        scrollPanelToTop();
        return;
      }
    } else {
      const validationError = validateGuestDeliveryStep(deliveryInfo, requiresAddress);
      if (validationError) {
        setError(validationError);
        scrollPanelToTop();
        return;
      }
    }

    setGuestInfo(deliveryInfo);

    transitionLockRef.current = true;
    setIsContinuing(true);
    try {
      advanceStep("payment");
    } finally {
      setIsContinuing(false);
      transitionLockRef.current = false;
    }
  }

  async function handlePay(options?: { forceMock?: boolean }) {
    if (!listing || !totals) return;
    setError("");
    setIsLoading(true);
    try {
      const sessionUser = getSessionSnapshot();
      const normalized = normalizeGuestBuyer(guestInfo);
      const isGuest = guestCheckout && !sessionUser;
      const deliveryInfo: GuestDeliveryInfo = {
        ...guestInfo,
        ...normalized,
        shippingMethod,
      };

      if (isGuest) {
        const validationError = validateGuestDeliveryStep(deliveryInfo, requiresAddress);
        if (validationError) {
          setError(validationError);
          return;
        }
      } else if (!sessionUser) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      const selectedAddress = addresses.find((item) => item.id === selectedAddressId);

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          isGuest,
          forceMock: options?.forceMock === true,
          buyer: {
            id: sessionUser?.id,
            email: sessionUser?.email ?? normalized.email,
            fullName: sessionUser?.fullName ?? normalized.fullName,
            phone: sessionUser?.phone ?? normalized.phone,
            role: sessionUser?.role,
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
          addressId: sessionUser && selectedAddressId ? selectedAddressId : undefined,
          deliveryAddress:
            requiresAddress && (!sessionUser || !selectedAddress)
              ? buildDeliveryAddressInput(deliveryInfo, normalized)
              : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(formatCheckoutApiError(data));
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

  const showDeliveryStep =
    shippable || (guestCheckout && !sessionUser);

  const steps: CheckoutStep[] = ["review"];
  if (showDeliveryStep) steps.push("delivery");
  steps.push("payment");

  const mockCheckoutEnabled = isMockCheckoutEnabled();

  return (
    <section className="app-container page-padding">
      <PageHero
        description="خطوات سريعة وآمنة لإتمام الشراء عبر الضمان المالي."
        eyebrow="الدفع"
        title="إتمام الشراء"
      />

      <div className="mx-auto mt-6 max-w-3xl" ref={panelRef}>
        <div className="mb-6 flex flex-wrap gap-2">
          {steps.map((item, index) => (
            <Badge key={item} variant={step === item ? "premium" : "muted"}>
              {index + 1}.{" "}
              {item === "review"
                ? "مراجعة الطلب"
                : item === "delivery"
                  ? "التوصيل والتواصل"
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
                {showsEscrowProtection(listing) ? (
                  <Badge className="mt-2" variant="escrow">
                    ضمان مالي — دفع عبر المنصة
                  </Badge>
                ) : null}
              </div>
            </div>
            {guestCheckout && !sessionUser ? (
              <p className="mt-4 text-sm text-muted">
                يمكنك إتمام الشراء كضيف دون تسجيل الدخول.
              </p>
            ) : null}
            <div className="mt-6 flex gap-2">
              <Button
                loading={isContinuing}
                onClick={handleContinueFromReview}
                type="button"
                variant="accent"
              >
                متابعة
              </Button>
              <Button href={backHref} type="button" variant="secondary">
                إلغاء
              </Button>
            </div>
          </Card>
        ) : null}

        {step === "delivery" && showDeliveryStep ? (
          <Card className="grid gap-4 p-6" variant="flat">
            <h3 className="font-black text-ink">بيانات المشتري</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="الاسم الكامل"
                name="fullName"
                onChange={(event) =>
                  setGuestInfo((prev) => ({ ...prev, fullName: event.target.value }))
                }
                required
                value={guestInfo.fullName}
              />
              <Input
                label="البريد الإلكتروني"
                name="email"
                onBlur={() => checkEmailExists(guestInfo.email)}
                onChange={(event) =>
                  setGuestInfo((prev) => ({ ...prev, email: event.target.value }))
                }
                required
                type="email"
                value={guestInfo.email}
              />
              <Input
                dir="ltr"
                inputMode="tel"
                label="رقم الجوال"
                name="phone"
                onChange={(event) =>
                  setGuestInfo((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
                type="tel"
                value={guestInfo.phone}
              />
            </div>
            {existingAccountHint ? (
              <FormMessage variant="success">
                يمكنك متابعة الشراء. إذا كان لديك حساب سابق، يمكنك تسجيل الدخول لاحقًا لمتابعة
                جميع طلباتك.
              </FormMessage>
            ) : null}

            {shippable ? (
              <>
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

                {requiresAddress ? (
                  <>
                    <h3 className="font-black text-ink">عنوان التوصيل</h3>
                    {sessionUser && addresses.length > 0 ? (
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
                    ) : null}
                    {(!sessionUser || addresses.length === 0) && (
                      <div className="grid gap-3">
                        <Select
                          label="الإمارة"
                          name="emirate"
                          onChange={(event) =>
                            setGuestInfo((prev) => ({ ...prev, emirate: event.target.value }))
                          }
                          options={cities.map((city) => ({ label: city.name, value: city.name }))}
                          required
                          value={guestInfo.emirate}
                        />
                        <Input
                          label="عنوان التوصيل"
                          name="addressLine"
                          onChange={(event) =>
                            setGuestInfo((prev) => ({ ...prev, addressLine: event.target.value }))
                          }
                          placeholder="مثال: الخليج التجاري، برج الإمارات، الطابق 12"
                          required
                          value={guestInfo.addressLine}
                        />
                        {sessionUser ? (
                          <label className="flex items-center gap-2 text-sm text-muted">
                            <input
                              checked={guestInfo.saveAddress}
                              onChange={(event) =>
                                setGuestInfo((prev) => ({
                                  ...prev,
                                  saveAddress: event.target.checked,
                                }))
                              }
                              type="checkbox"
                            />
                            حفظ العنوان
                          </label>
                        ) : null}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted">
                    الاستلام من البائع — لا يلزم إدخال عنوان توصيل كامل.
                  </p>
                )}
              </>
            ) : null}

            <div className="sticky bottom-0 z-10 -mx-2 flex gap-2 border-t border-border bg-surface/95 p-4 backdrop-blur-sm supports-[backdrop-filter]:bg-surface/90 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <Button
                className="flex-1 md:flex-none"
                loading={isContinuing}
                onClick={handleContinueFromDelivery}
                type="button"
                variant="accent"
              >
                متابعة للدفع
              </Button>
              <Button onClick={() => advanceStep("review")} type="button" variant="secondary">
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
            <div className="flex flex-wrap gap-2">
              <Button
                loading={isLoading}
                onClick={() => handlePay()}
                type="button"
                variant="accent"
              >
                تأكيد الدفع عبر Stripe
              </Button>
              {mockCheckoutEnabled ? (
                <Button
                  loading={isLoading}
                  onClick={() => handlePay({ forceMock: true })}
                  type="button"
                  variant="secondary"
                >
                  إتمام تجريبي (بدون Stripe)
                </Button>
              ) : null}
              <Button
                onClick={() => advanceStep(showDeliveryStep ? "delivery" : "review")}
                type="button"
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
