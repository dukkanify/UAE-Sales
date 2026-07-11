"use client";

import { useRouter } from "next/navigation";
import type { Category, Listing } from "@/types";
import { ListingPrimaryAction } from "@/features/listings/components/ListingPrimaryAction";
import { SellerContactActions } from "@/features/listings/components/ListingPrimaryAction";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import {
  ACTION_LABELS,
  getListingActionConfig,
  type ListingActionType,
} from "@/shared/constants/listingActionConfig";
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
        {config.showEscrowBadge && listing.escrowAvailable ? (
          <Badge variant="escrow">ضمان مالي</Badge>
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

export function MobileStickyActionBar({ listing }: MobileStickyActionBarProps) {
  const router = useRouter();
  const config = getListingActionConfig(listing);
  const user = typeof window !== "undefined" ? getSessionUser() : null;
  const isOwn = user ? isOwnListing(listing, user) : false;
  const tel = getTelHref(listing);
  const whatsapp = getWhatsAppHref(listing, getListingCanonicalUrl(listing));

  const primaryLabel = ACTION_LABELS[config.primaryAction];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-3 py-2 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {tel ? (
          <a
            aria-label="اتصال"
            className="focus-ring inline-flex min-h-11 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xl)] bg-surface-muted px-2 text-[0.65rem] font-semibold"
            href={tel}
          >
            <Icon name="phone" size={16} />
            اتصال
          </a>
        ) : null}
        {whatsapp ? (
          <a
            aria-label="واتساب"
            className="focus-ring inline-flex min-h-11 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-[var(--radius-xl)] bg-surface-muted px-2 text-[0.65rem] font-semibold"
            href={whatsapp}
            rel="noopener noreferrer"
            target="_blank"
          >
            واتساب
          </a>
        ) : null}
        <div className="min-w-[4.25rem]">
          <StartChatButton listing={listing} size="sm" variant="secondary" />
        </div>
        {!isOwn && config.showBuyNow ? (
          <button
            className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-xl)] bg-secondary px-3 text-sm font-bold text-primary"
            onClick={() => router.push(getCheckoutPath(listing))}
            type="button"
          >
            {primaryLabel}
          </button>
        ) : !isOwn ? (
          <div className="flex-1">
            <ListingPrimaryAction
              action={config.primaryAction}
              listing={listing}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
