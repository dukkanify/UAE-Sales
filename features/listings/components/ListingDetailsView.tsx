"use client";

import type { Category, Listing } from "@/types";
import { EscrowProtectionCard } from "@/features/listings/components/EscrowProtectionCard";
import { ListingPlatformNotice } from "@/features/listings/components/ListingPlatformNotice";
import { ListingDetailToolbar } from "@/features/listings/components/ListingDetailToolbar";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { ListingLocationMap } from "@/features/listings/components/ListingLocationMap";
import { ListingSafetyTips } from "@/features/listings/components/ListingSafetyTips";
import { ListingSpecifications } from "@/features/listings/components/ListingSpecifications";
import {
  ListingStickyPanel,
  MobileStickyActionBar,
} from "@/features/listings/components/ListingStickyPanel";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { SellerPanel } from "@/features/listings/components/SellerPanel";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { listingDescription } from "@/shared/i18n/listing-copy";
import { ListingTitle } from "@/shared/i18n/ListingTitle";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { useLocale } from "@/shared/i18n/useLocale";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { formatPostedTime } from "@/features/listings/components/listing-card.utils";
import { getListingCardBadges } from "@/features/listings/components/listing-card-badges";
import { Badge } from "@/shared/ui/Badge";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { Icon } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";

type ListingDetailsViewProps = {
  breadcrumbs: { href?: string; label: string }[];
  category?: Category;
  listing: Listing;
  relatedListings?: Listing[];
};

export function ListingDetailsView({
  breadcrumbs,
  category,
  listing,
  relatedListings = [],
}: ListingDetailsViewProps) {
  const locale = useLocale();
  const escrowProtected = showsEscrowProtection(listing);
  const locationLabel = listing.area
    ? `${listing.area}، ${listing.emirate ?? listing.city}`
    : listing.emirate
      ? `${listing.city}، ${listing.emirate}`
      : listing.city;

  return (
    <LocalizedTree>
    <>
      <section className="app-container page-padding scroll-mt-20 pb-28 lg:pb-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="listing-details-grid grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-x-8">
          <div className="min-w-0 lg:col-start-1">
            <ListingGallery listing={listing} />

            {listing.videoUrl ? (
              <div className="marketplace-panel mt-4 p-4">
                <p className="text-sm font-semibold text-ink">فيديو الإعلان</p>
                <a
                  className="mt-1 block break-all text-sm font-medium text-primary underline-offset-2 hover:underline"
                  href={listing.videoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {listing.videoUrl}
                </a>
              </div>
            ) : null}

            <div className="mt-4 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                {getListingCardBadges(listing).map((badge) => (
                  <Badge key={badge.key} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
                {category ? <Badge variant="muted">{category.name}</Badge> : null}
                {escrowProtected ? (
                  <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-black leading-tight text-ink">
                <ListingTitle listing={listing} />
              </h1>
              <div className="mt-2">
                <CurrencyAmount amount={listing.price} size="lg" />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                <span className="inline-flex items-center gap-1">
                  <Icon name="map" size={14} />
                  {locationLabel}
                </span>
                {listing.postedAt ? (
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" size={14} />
                    {formatPostedTime(listing.postedAt)}
                  </span>
                ) : null}
              </div>
            </div>

            <ListingDetailToolbar listing={listing} />
            <ListingLocationMap listing={listing} />

            <div className="marketplace-panel mt-6 p-6">
              <h2 className="text-lg font-black text-ink">وصف الإعلان</h2>
              <p className="mt-4 text-sm font-medium leading-8 text-muted" data-ugc>
                {listingDescription(listing, locale)}
              </p>
            </div>

            <ListingSpecifications listing={listing} />
            <div className="mt-6 lg:hidden">
              <SellerPanel listing={listing} />
            </div>
            <ListingSafetyTips />
            <div className="mt-6 lg:hidden">
              <ListingPlatformNotice listing={listing} />
            </div>
          </div>

          <aside
            aria-label="ملخص الإعلان والبائع"
            className="hidden min-w-0 w-full max-w-full lg:col-start-2 lg:block"
          >
            <div className="flex w-full min-w-0 max-w-full flex-col gap-6">
              <section aria-label="تفاصيل الإعلان والإجراءات">
                <ListingStickyPanel category={category} listing={listing} />
              </section>

              <section aria-label="معلومات البائع">
                <SellerPanel listing={listing} />
              </section>

              <section aria-label="الضمان والحماية" className="flex flex-col gap-6">
                <EscrowProtectionCard listing={listing} />
                <ListingPlatformNotice listing={listing} />
              </section>
            </div>
          </aside>
        </div>
      </section>

      {relatedListings.length > 0 ? (
        <section className="app-container page-padding pb-28 lg:pb-8">
          <SectionHeader
            description="إعلانات من نفس التصنيف قد تعجبك."
            eyebrow="مشابه"
            title="قد يعجبك أيضاً"
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedListings.map((relatedListing) => (
              <ListingCard
                key={relatedListing.id}
                categoryName={category?.name}
                listing={relatedListing}
              />
            ))}
          </div>
        </section>
      ) : null}

      <MobileStickyActionBar listing={listing} />
    </>
    </LocalizedTree>
  );
}
