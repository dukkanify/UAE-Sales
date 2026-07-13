"use client";

import type { Category, Listing } from "@/types";
import { EscrowProtectionCard } from "@/features/listings/components/EscrowProtectionCard";
import { ListingPlatformNotice } from "@/features/listings/components/ListingPlatformNotice";
import { ListingDetailToolbar } from "@/features/listings/components/ListingDetailToolbar";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { ListingMapPlaceholder } from "@/features/listings/components/ListingMapPlaceholder";
import { ListingSafetyTips } from "@/features/listings/components/ListingSafetyTips";
import { ListingSpecifications } from "@/features/listings/components/ListingSpecifications";
import {
  ListingStickyPanel,
  MobileStickyActionBar,
} from "@/features/listings/components/ListingStickyPanel";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { SellerPanel } from "@/features/listings/components/SellerPanel";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { formatPostedTime } from "@/features/listings/components/listing-card.utils";
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

const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

export function ListingDetailsView({
  breadcrumbs,
  category,
  listing,
  relatedListings = [],
}: ListingDetailsViewProps) {
  const escrowProtected = showsEscrowProtection(listing);
  const locationLabel = listing.area
    ? `${listing.area}، ${listing.emirate ?? listing.city}`
    : listing.emirate
      ? `${listing.city}، ${listing.emirate}`
      : listing.city;

  return (
    <>
      <section className="app-container page-padding scroll-mt-20 pb-28 lg:pb-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="listing-details-grid grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start">
          <div className="min-w-0 lg:col-start-1">
            <ListingGallery listing={listing} />

            <div className="mt-4 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                {listing.isFeatured ? <Badge variant="featured">إعلان مميز</Badge> : null}
                {listing.verifiedSeller ? <Badge variant="verified">بائع موثق</Badge> : null}
                {category ? <Badge variant="muted">{category.name}</Badge> : null}
                <Badge variant="muted">{conditionLabels[listing.condition]}</Badge>
                {escrowProtected ? (
                  <Badge variant="escrow">ضمان مالي — دفع عبر المنصة</Badge>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-black leading-tight text-ink">
                {listing.title}
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
            <ListingMapPlaceholder listing={listing} />

            <div className="marketplace-panel mt-6 p-6">
              <h2 className="text-lg font-black text-ink">وصف الإعلان</h2>
              <p className="mt-4 text-sm font-medium leading-8 text-muted">
                {listing.description}
              </p>
              {listing.descriptionEnglish ? (
                <p className="mt-4 border-t border-border pt-4 text-sm leading-7 text-muted/80">
                  {listing.descriptionEnglish}
                </p>
              ) : null}
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

          <aside className="hidden min-w-0 w-full max-w-full overflow-hidden lg:col-start-2 lg:block">
            <div className="flex w-full min-w-0 max-w-full flex-col gap-4">
              <ListingStickyPanel category={category} listing={listing} />
              <SellerPanel listing={listing} />
              <EscrowProtectionCard listing={listing} />
              <ListingPlatformNotice listing={listing} />
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
  );
}
