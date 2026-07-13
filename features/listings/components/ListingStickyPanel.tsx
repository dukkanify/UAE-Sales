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

export function MobileStickyActionBar({ listing }: MobileStickyActionBarProps) {
  const router = useRouter();
  const config = getListingActionConfig(listing);
  const user = typeof window !== "undefined" ? getSessionUser() : null;
  const isOwn = user ? isOwnListing(listing, user) : false;
  const tel = getTelHref(listing);
  const whatsapp = getWhatsAppHref(listing, getListingCanonicalUrl(listing));
  const showContactRail = Boolean(tel || whatsapp);

  const primaryLabel = ACTION_LABELS[config.primaryAction];

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-surface/96 px-3 py-2.5 shadow-[0_-10px_40px_rgb(15_23_42/10%)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch gap-2">
        {!isOwn && config.showBuyNow ? (
          <button
            className="focus-ring inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-[var(--radius-xl)] bg-secondary px-3 text-sm font-bold text-primary shadow-[0_6px_18px_rgb(201_164_92/28%)] transition active:scale-[0.98]"
            onClick={() => router.push(getCheckoutPath(listing))}
            type="button"
          >
            {primaryLabel}
          </button>
        ) : !isOwn ? (
          <div className="min-w-0 flex-1">
            <ListingPrimaryAction
              action={config.primaryAction}
              listing={listing}
              size="sm"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 items-stretch gap-1.5">
          {showContactRail ? (
            <div className="flex items-center gap-1 rounded-[1.125rem] border border-border/70 bg-surface-muted/70 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/65%)]">
              <StartChatButton
                className="!min-h-10 !rounded-xl !border-0 !bg-transparent !px-2.5 !text-[0.68rem] !font-bold !shadow-none hover:!bg-surface"
                listing={listing}
                size="sm"
                variant="ghost"
              />

              {tel ? (
                <a
                  aria-label="اتصال بالبائع"
                  className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-border/60 bg-surface text-primary transition hover:border-secondary/40 hover:bg-surface active:scale-95"
                  href={tel}
                >
                  <Icon name="phone" size={17} />
                </a>
              ) : null}

              {whatsapp ? (
                <a
                  aria-label="واتساب"
                  className="focus-ring inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-[#25D366] via-[#1ebe5d] to-[#128C7E] px-2.5 text-[0.68rem] font-extrabold text-white shadow-[0_4px_16px_rgb(37_211_102/38%)] transition active:scale-95"
                  href={whatsapp}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="drop-shadow-sm" name="whatsapp" size={17} />
                  <span>واتساب</span>
                </a>
              ) : null}
            </div>
          ) : (
            <div className="flex min-w-[7.5rem] items-center">
              <StartChatButton
                className="!min-h-11 !rounded-xl"
                fullWidth
                listing={listing}
                size="sm"
                variant="secondary"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
