"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Category, Listing } from "@/types";
import { ListingPrimaryAction } from "@/features/listings/components/ListingPrimaryAction";
import { SellerContactActions } from "@/features/listings/components/ListingPrimaryAction";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import {
  ACTION_LABELS,
  getListingActionConfig,
} from "@/shared/constants/listingActionConfig";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { isOwnListing } from "@/shared/listings/listing-ownership";
import { getCheckoutPath, getListingCanonicalUrl } from "@/shared/listings/listing-url";
import {
  getTelHref,
  getWhatsAppHref,
} from "@/shared/listings/listing-contact";
import { formatPostedTime } from "@/features/listings/components/listing-card.utils";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { StartChatButton } from "@/features/chat/components/StartChatButton";
import { getSessionUser } from "@/services/storage";
import "./mobile-sticky-action-bar.css";

type ListingStickyPanelProps = {
  category?: Category;
  listing: Listing;
};

const conditionVariants: Record<Listing["condition"], "new" | "muted" | "premium"> = {
  excellent: "premium",
  new: "new",
  used: "muted",
};

const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function ListingStickyPanel({ category, listing }: ListingStickyPanelProps) {
  const config = getListingActionConfig(listing);
  const user = typeof window !== "undefined" ? getSessionUser() : null;
  const isOwn = user ? isOwnListing(listing, user) : false;

  const locationLabel = listing.area
    ? `${listing.area}، ${listing.emirate ?? listing.city}`
    : listing.emirate
      ? `${listing.city}، ${listing.emirate}`
      : listing.city;

  return (
    <Card className="marketplace-panel w-full min-w-0 p-6">
        <div className="flex flex-wrap items-center gap-2">
        {category ? <Badge variant="muted">{category.name}</Badge> : null}
        <Badge variant={conditionVariants[listing.condition]}>
          {conditionLabels[listing.condition]}
        </Badge>
        {showsEscrowProtection(listing) ? (
          <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
        ) : null}
        </div>

        <h1 className="mt-4 text-2xl font-black leading-tight text-ink">{listing.title}</h1>
        <div className="mt-4">
          <CurrencyAmount amount={listing.price} size="xl" />
        </div>

        <div className="mt-6 grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <span className="shrink-0 font-medium text-muted">الموقع</span>
          <span className="min-w-0 text-end inline-flex items-center gap-1.5 font-semibold text-ink">
            <Icon name="map" size={14} />
            {locationLabel}
          </span>
        </div>
        {listing.postedAt ? (
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-medium text-muted">تاريخ النشر</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="clock" size={14} />
              {formatPostedTime(listing.postedAt)}
            </span>
          </div>
        ) : null}
        {listing.views > 0 ? (
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted">المشاهدات</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="eye" size={14} />
              {listing.views.toLocaleString("ar-AE")}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-2">
        {!isOwn ? (
          <ListingPrimaryAction action={config.primaryAction} listing={listing} />
        ) : null}
        <SellerContactActions
          hidePhone={config.primaryAction === "CONTACT_SELLER"}
          listing={listing}
          stacked
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <FavoriteButton className="w-full" listing={listing} />
        <ShareButton className="w-full" listing={listing} />
      </div>
    </Card>
  );
}

type MobileStickyActionBarProps = {
  listing: Listing;
};

function MobileContactIconButton({
  ariaLabel,
  children,
  className = "",
  external = false,
  href,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const classes = `focus-ring mobile-sticky-bar__icon ${className}`.trim();

  if (href) {
    return (
      <a
        aria-label={ariaLabel}
        className={classes}
        href={href}
        {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button aria-label={ariaLabel} className={classes} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function MobileStickyActionBar({ listing }: MobileStickyActionBarProps) {
  const router = useRouter();
  const config = getListingActionConfig(listing);
  const user = typeof window !== "undefined" ? getSessionUser() : null;
  const isOwn = user ? isOwnListing(listing, user) : false;
  const tel = getTelHref(listing);
  const whatsapp = getWhatsAppHref(listing, getListingCanonicalUrl(listing));
  const showContactRail = Boolean(tel || whatsapp);
  const showPhoneInRail = Boolean(tel && config.primaryAction !== "CONTACT_SELLER");
  const primaryLabel = ACTION_LABELS[config.primaryAction];

  return (
    <div className="mobile-sticky-bar">
      <div className="mobile-sticky-bar__inner">
        {!isOwn && config.showBuyNow ? (
          <button
            className="focus-ring mobile-sticky-bar__cta"
            onClick={() => router.push(getCheckoutPath(listing))}
            type="button"
          >
            <Icon name="package" size={18} />
            {primaryLabel}
          </button>
        ) : !isOwn ? (
          <div className="mobile-sticky-bar__cta-shell">
            <ListingPrimaryAction
              action={config.primaryAction}
              className="mobile-sticky-bar__cta"
              listing={listing}
              size="sm"
            />
          </div>
        ) : null}

        {showContactRail ? (
          <div className="mobile-sticky-bar__actions">
            <StartChatButton
              className="mobile-sticky-bar__icon mobile-sticky-bar__icon--chat"
              layout="icon"
              listing={listing}
              size="sm"
              variant="ghost"
            />

            {whatsapp ? (
              <MobileContactIconButton
                ariaLabel="مراسلة عبر واتساب"
                className="mobile-sticky-bar__icon--whatsapp"
                external
                href={whatsapp}
              >
                <Icon name="whatsapp" size={20} />
              </MobileContactIconButton>
            ) : null}

            {showPhoneInRail ? (
              <MobileContactIconButton
                ariaLabel="اتصال بالبائع"
                className="mobile-sticky-bar__icon--call"
                href={tel ?? undefined}
              >
                <Icon name="phone-call" size={19} />
              </MobileContactIconButton>
            ) : null}
          </div>
        ) : !isOwn ? (
          <div className="mobile-sticky-bar__actions">
            <StartChatButton
              className="mobile-sticky-bar__icon mobile-sticky-bar__icon--chat"
              layout="icon"
              listing={listing}
              size="sm"
              variant="ghost"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
