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
    <Card className="marketplace-panel p-6 lg:sticky lg:top-24 lg:self-start">
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
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-medium text-muted">الموقع</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
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
        <SellerContactActions listing={listing} stacked />
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

const MOBILE_BAR_PRIMARY_CLASS =
  "!inline-flex !min-h-11 !flex-1 !items-center !justify-center !gap-1.5 !rounded-full !bg-primary !px-4 !text-[0.8125rem] !font-bold !text-secondary !shadow-[0_4px_14px_rgb(15_23_42/14%)] hover:!bg-[#1a2844] active:!scale-[0.98]";

const MOBILE_CONTACT_BTN_CLASS =
  "focus-ring grid size-11 shrink-0 place-items-center rounded-full border border-border/70 bg-white text-ink shadow-[0_1px_6px_rgb(15_23_42/6%)] transition duration-200 hover:border-secondary/30 hover:bg-surface-muted active:scale-[0.96]";

const MOBILE_CHAT_BTN_CLASS = `${MOBILE_CONTACT_BTN_CLASS} !min-h-0 !p-0 !text-primary hover:!bg-surface-muted`;

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
  const classes = `${MOBILE_CONTACT_BTN_CLASS} ${className}`.trim();

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
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-white/96 shadow-[0_-8px_32px_rgb(15_23_42/8%)] backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 px-3.5 py-2">
        {!isOwn && config.showBuyNow ? (
          <button
            className={`focus-ring inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-[0.8125rem] font-bold text-secondary shadow-[0_4px_14px_rgb(15_23_42/14%)] transition hover:bg-[#1a2844] active:scale-[0.98] ${showContactRail ? "" : "w-full"}`}
            onClick={() => router.push(getCheckoutPath(listing))}
            type="button"
          >
            <Icon name="package" size={16} />
            {primaryLabel}
          </button>
        ) : !isOwn ? (
          <div className={`min-w-0 flex-1 ${showContactRail ? "" : "w-full"}`}>
            <ListingPrimaryAction
              action={config.primaryAction}
              className={MOBILE_BAR_PRIMARY_CLASS}
              listing={listing}
              size="sm"
            />
          </div>
        ) : null}

        {showContactRail ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <StartChatButton
              className={MOBILE_CHAT_BTN_CLASS}
              layout="icon"
              listing={listing}
              size="sm"
              variant="ghost"
            />

            {whatsapp ? (
              <MobileContactIconButton
                ariaLabel="مراسلة عبر واتساب"
                className="text-[#1a9f5c]"
                external
                href={whatsapp}
              >
                <Icon name="whatsapp" size={18} />
              </MobileContactIconButton>
            ) : null}

            {showPhoneInRail ? (
              <MobileContactIconButton ariaLabel="اتصال بالبائع" className="text-primary" href={tel ?? undefined}>
                <Icon name="phone" size={18} />
              </MobileContactIconButton>
            ) : null}
          </div>
        ) : !isOwn ? (
          <StartChatButton
            className={MOBILE_CHAT_BTN_CLASS}
            layout="icon"
            listing={listing}
            size="sm"
            variant="ghost"
          />
        ) : null}
      </div>
    </div>
  );
}
