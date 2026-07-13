"use client";

import type { Listing } from "@/types";
import { StartChatButton } from "@/features/chat/components/StartChatButton";
import { JobApplicationModal } from "@/features/listings/components/JobApplicationModal";
import { QuoteRequestModal } from "@/features/listings/components/QuoteRequestModal";
import { ViewingBookingModal } from "@/features/listings/components/ViewingBookingModal";
import {
  ACTION_LABELS,
  getListingActionConfig,
  type ListingActionType,
} from "@/shared/constants/listingActionConfig";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import {
  getMaskedPhone,
  getTelHref,
  getWhatsAppHref,
} from "@/shared/listings/listing-contact";
import { getCheckoutPath, getListingCanonicalUrl } from "@/shared/listings/listing-url";
import { isGuestCheckoutEnabled } from "@/shared/constants/feature-flags";
import { useToast } from "@/shared/components/ToastProvider";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ActiveModal = "job" | "viewing" | "quote" | "service" | null;

type ListingPrimaryActionProps = {
  action: ListingActionType;
  className?: string;
  fullWidth?: boolean;
  listing: Listing;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "accent";
};

const PRIMARY_ACTION_ICONS: Partial<Record<ListingActionType, IconName>> = {
  APPLY_JOB: "briefcase",
  BOOK_SERVICE: "wrench",
  BOOK_VIEWING: "eye",
  BUY_NOW: "package",
  CONTACT_SELLER: "phone",
  REQUEST_QUOTE: "send",
  RESERVE: "car",
};

export function ListingPrimaryAction({
  action,
  className,
  fullWidth = true,
  listing,
  size = "lg",
  variant = "accent",
}: ListingPrimaryActionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const config = getListingActionConfig(listing);
  const [phoneConfirm, setPhoneConfirm] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  if (action === "SEND_MESSAGE") {
    return <StartChatButton fullWidth={fullWidth} listing={listing} size={size} />;
  }

  function requireAuth(nextPath: string): boolean {
    const user = getSessionUser();
    if (user) return true;
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    return false;
  }

  function handleBuyOrReserve() {
    if (listing.status !== "active") {
      showToast(LISTING_ERRORS.listingUnavailable, "error");
      return;
    }
    const user = getSessionUser();
    if (user && isOwnListing(listing, user)) {
      showToast(LISTING_ERRORS.ownListing, "error");
      return;
    }
    const checkoutPath = getCheckoutPath(listing);
    if (!isGuestCheckoutEnabled() && !requireAuth(checkoutPath)) return;
    router.push(checkoutPath);
  }

  function openModal(modal: ActiveModal) {
    const listingPath = listing.id.startsWith("local-")
      ? `/listings/local/${listing.id}`
      : `/listings/${listing.slug}`;
    if (!requireAuth(listingPath)) return;
    const user = getSessionUser();
    if (user && isOwnListing(listing, user)) {
      showToast(LISTING_ERRORS.ownListing, "error");
      return;
    }
    setActiveModal(modal);
  }

  function handleClick() {
    switch (action) {
      case "BUY_NOW":
      case "RESERVE":
        if (config.checkoutEnabled) handleBuyOrReserve();
        else showToast(LISTING_ERRORS.listingUnavailable, "error");
        break;
      case "CONTACT_SELLER": {
        const tel = getTelHref(listing);
        if (!tel) {
          showToast(LISTING_ERRORS.phoneUnavailable, "error");
          return;
        }
        setPhoneConfirm(true);
        break;
      }
      case "APPLY_JOB":
        openModal("job");
        break;
      case "BOOK_VIEWING":
        openModal("viewing");
        break;
      case "REQUEST_QUOTE":
        openModal("quote");
        break;
      case "BOOK_SERVICE":
        openModal("service");
        break;
      default:
        break;
    }
  }

  const tel = getTelHref(listing);
  const masked = getMaskedPhone(listing);

  return (
    <>
      <Button
        className={className}
        fullWidth={fullWidth}
        onClick={handleClick}
        size={size}
        variant={variant}
      >
        {PRIMARY_ACTION_ICONS[action] ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name={PRIMARY_ACTION_ICONS[action]} size={16} />
            {ACTION_LABELS[action]}
          </span>
        ) : (
          ACTION_LABELS[action]
        )}
      </Button>
      {phoneConfirm && tel ? (
        <div className="mt-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted p-4">
          <p className="text-sm font-semibold text-ink">هل تريد الاتصال بالبائع؟</p>
          {masked ? <p className="mt-1 text-xs text-muted">{masked}</p> : null}
          <div className="mt-3 flex gap-2">
            <Button href={tel} size="sm" variant="accent">
              اتصال
            </Button>
            <Button onClick={() => setPhoneConfirm(false)} size="sm" variant="secondary">
              إلغاء
            </Button>
          </div>
        </div>
      ) : null}

      <JobApplicationModal
        listing={listing}
        onClose={() => setActiveModal(null)}
        onSuccess={() => showToast("تم إرسال طلب التوظيف بنجاح")}
        open={activeModal === "job"}
      />
      <ViewingBookingModal
        listing={listing}
        onClose={() => setActiveModal(null)}
        onSuccess={() => showToast("تم تأكيد حجز المعاينة")}
        open={activeModal === "viewing"}
      />
      <QuoteRequestModal
        listing={listing}
        onClose={() => setActiveModal(null)}
        onSuccess={() => showToast("تم إرسال الطلب بنجاح")}
        open={activeModal === "quote"}
      />
      <QuoteRequestModal
        kind="service_booking"
        listing={listing}
        onClose={() => setActiveModal(null)}
        onSuccess={() => showToast("تم إرسال طلب حجز الخدمة")}
        open={activeModal === "service"}
      />
    </>
  );
}

type SellerContactActionsProps = {
  hidePhone?: boolean;
  listing: Listing;
  stacked?: boolean;
};

export function SellerContactActions({
  hidePhone = false,
  listing,
  stacked = false,
}: SellerContactActionsProps) {
  const [phoneConfirm, setPhoneConfirm] = useState(false);
  const tel = getTelHref(listing);
  const whatsapp = getWhatsAppHref(listing, getListingCanonicalUrl(listing));
  const masked = getMaskedPhone(listing);
  const gridClass = stacked ? "grid gap-2" : "grid gap-2 sm:grid-cols-2";

  return (
    <div className={gridClass}>
      {tel && !hidePhone ? (
        <Button onClick={() => setPhoneConfirm(true)} variant="secondary">
          اتصال
        </Button>
      ) : null}
      {whatsapp ? (
        <a
          className="focus-ring interactive-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[#25D366]/25 bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 px-5 text-sm font-semibold text-[#128C7E] shadow-[var(--shadow-xs)] transition duration-200 hover:border-[#25D366]/45"
          href={whatsapp}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon name="whatsapp" size={16} />
          واتساب
        </a>
      ) : null}
      <StartChatButton listing={listing} variant="secondary" />
      {phoneConfirm && tel ? (
        <div className="sm:col-span-2">
          <FormMessage variant="success">
            {`هل تريد الاتصال بالبائع؟${masked ? ` (${masked})` : ""}`}
          </FormMessage>
          <div className="mt-2 flex gap-2">
            <Button href={tel} size="sm" variant="accent">
              تأكيد الاتصال
            </Button>
            <Button onClick={() => setPhoneConfirm(false)} size="sm" variant="ghost">
              إلغاء
            </Button>
          </div>
        </div>
      ) : null}
      {!tel && !whatsapp ? (
        <p className="text-xs text-muted sm:col-span-2">
          التواصل متاح عبر المحادثة داخل سوقنا.
        </p>
      ) : null}
    </div>
  );
}
