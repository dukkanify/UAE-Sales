"use client";

import type { Listing } from "@/types";
import { StartChatButton } from "@/features/chat/components/StartChatButton";
import {
  ACTION_LABELS,
  getListingActionConfig,
  type ListingActionType,
} from "@/shared/constants/listingActionConfig";
import { LISTING_ERRORS } from "@/shared/constants/listing-errors";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import {
  getTelHref,
  getWhatsAppHref,
} from "@/shared/listings/listing-contact";
import { getCheckoutPath, getListingCanonicalUrl } from "@/shared/listings/listing-url";
import { isGuestCheckoutEnabled } from "@/shared/constants/feature-flags";
import { useToast } from "@/shared/components/ToastProvider";
import { Button } from "@/shared/ui/Button";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { getSessionUser } from "@/services/storage";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const JobApplicationModal = dynamic(
  () =>
    import("@/features/listings/components/JobApplicationModal").then(
      (mod) => mod.JobApplicationModal,
    ),
  { ssr: false },
);
const ViewingBookingModal = dynamic(
  () =>
    import("@/features/listings/components/ViewingBookingModal").then(
      (mod) => mod.ViewingBookingModal,
    ),
  { ssr: false },
);
const QuoteRequestModal = dynamic(
  () =>
    import("@/features/listings/components/QuoteRequestModal").then(
      (mod) => mod.QuoteRequestModal,
    ),
  { ssr: false },
);

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
  CONTACT_SELLER: "phone-call",
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
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  if (action === "SEND_MESSAGE") {
    return <StartChatButton fullWidth={fullWidth} listing={listing} size={size} />;
  }

  if (action === "CONTACT_SELLER") {
    return (
      <Button
        className={className}
        fullWidth={fullWidth}
        href={getTelHref(listing)}
        size={size}
        variant={variant}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name="phone-call" size={16} />
          {ACTION_LABELS.CONTACT_SELLER}
        </span>
      </Button>
    );
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

      {activeModal === "job" ? (
        <JobApplicationModal
          listing={listing}
          onClose={() => setActiveModal(null)}
          onSuccess={(_id, emailed) =>
            showToast(
              emailed
                ? "تم إرسال طلب التوظيف وأرسلنا تأكيدًا إلى بريدك"
                : "تم إرسال طلب التوظيف بنجاح",
            )
          }
          open
        />
      ) : null}
      {activeModal === "viewing" ? (
        <ViewingBookingModal
          listing={listing}
          onClose={() => setActiveModal(null)}
          onSuccess={(_id, emailed) =>
            showToast(
              emailed
                ? "تم تأكيد حجز المعاينة وأرسلنا التفاصيل إلى بريدك"
                : "تم تأكيد حجز المعاينة",
            )
          }
          open
        />
      ) : null}
      {activeModal === "quote" ? (
        <QuoteRequestModal
          listing={listing}
          onClose={() => setActiveModal(null)}
          onSuccess={(_id, emailed) =>
            showToast(
              emailed
                ? "تم إرسال الطلب وأرسلنا تأكيدًا إلى بريدك"
                : "تم إرسال الطلب بنجاح",
            )
          }
          open
        />
      ) : null}
      {activeModal === "service" ? (
        <QuoteRequestModal
          kind="service_booking"
          listing={listing}
          onClose={() => setActiveModal(null)}
          onSuccess={(_id, emailed) =>
            showToast(
              emailed
                ? "تم إرسال طلب حجز الخدمة وأرسلنا تأكيدًا إلى بريدك"
                : "تم إرسال طلب حجز الخدمة",
            )
          }
          open
        />
      ) : null}
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
  const tel = getTelHref(listing);
  const whatsapp = getWhatsAppHref(listing, getListingCanonicalUrl(listing));
  const gridClass = stacked ? "grid gap-2" : "grid gap-2 sm:grid-cols-2";

  return (
    <div className={gridClass}>
      {hidePhone ? null : (
        <Button href={tel} variant="secondary">
          <Icon className="shrink-0" name="phone-call" size={16} />
          اتصال
        </Button>
      )}
      <a
        className="focus-ring interactive-lift inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[#25D366]/25 bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 px-5 text-sm font-semibold text-[#128C7E] shadow-[var(--shadow-xs)] transition duration-200 hover:border-[#25D366]/45"
        href={whatsapp}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon name="whatsapp" size={18} />
        واتساب
      </a>
      <StartChatButton listing={listing} variant="secondary" />
    </div>
  );
}
