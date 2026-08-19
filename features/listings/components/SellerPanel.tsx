"use client";

import { useEffect, useState } from "react";
import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type SellerPanelProps = {
  listing: Listing;
};

function formatJoinedDate(joinedAt: string): string {
  const year = new Date(joinedAt).getFullYear();
  return Number.isFinite(year) ? String(year) : joinedAt;
}

function isUserCreatedListing(listing: Listing): boolean {
  return listing.id.startsWith("local-");
}

export function SellerPanel({ listing }: SellerPanelProps) {
  const isUserListing = isUserCreatedListing(listing);
  const isVerified = isUserListing
    ? Boolean(listing.seller.isVerified || listing.verifiedSeller)
    : Boolean(
        listing.verifiedSeller ??
          listing.seller.isVerified ??
          listing.seller.rating,
      );

  const [storeAverage, setStoreAverage] = useState<number | null>(null);
  const [storeCount, setStoreCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sellers/${encodeURIComponent(listing.seller.id)}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (typeof data.average === "number" && data.count > 0) {
          setStoreAverage(data.average);
          setStoreCount(data.count);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [listing.seller.id]);

  const rating =
    storeAverage ??
    (typeof listing.seller.rating === "number" ? listing.seller.rating : null);
  const reviewCount =
    storeCount ??
    (typeof listing.seller.reviewCount === "number"
      ? listing.seller.reviewCount
      : null);

  const showRating = typeof rating === "number" && rating > 0;
  const showReviews = typeof reviewCount === "number" && reviewCount > 0;
  const showCompany = listing.seller.sellerType === "business";
  const showResponseTime = Boolean(listing.seller.responseTime?.trim());
  const showJoinedAt = Boolean(listing.seller.joinedAt?.trim());
  const showTransactions =
    typeof listing.seller.completedTransactions === "number";

  return (
    <LocalizedTree>
    <Card className="marketplace-panel w-full min-w-0 p-6">
      <h2 className="text-base font-black text-ink">البائع</h2>
      <div className="mt-4 flex items-center gap-3">
        {listing.seller.avatarUrl ? (
          <span className="relative size-12 overflow-hidden rounded-[var(--radius-xl)]">
            <AppImage
              alt={listing.seller.name}
              className="object-cover"
              fallback="avatar"
              fill
              sizes="48px"
              src={listing.seller.avatarUrl}
            />
          </span>
        ) : (
          <span className="grid size-12 place-items-center rounded-[var(--radius-xl)] bg-primary text-sm font-semibold text-white">
            {listing.seller.name.slice(0, 2)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink" data-ugc>{listing.seller.name}</p>
          {showRating ? (
            <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-sm font-medium text-muted">
              <Icon className="text-secondary" name="star" size={14} />
              {rating}
              {showReviews ? (
                <>
                  <span className="text-border">·</span>
                  {reviewCount!.toLocaleString("en-AE")} تقييم
                </>
              ) : null}
            </p>
          ) : null}
          {showCompany ? (
            <p className="mt-0.5 text-xs font-medium text-muted">شركة</p>
          ) : null}
        </div>
        {isVerified ? <Badge variant="verified">موثق</Badge> : null}
      </div>

      {showResponseTime || showJoinedAt || showTransactions ? (
        <div className="mt-5 grid gap-2 text-sm">
          {showResponseTime ? (
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
              <span className="font-medium text-muted">الرد</span>
              <span className="font-semibold text-ink">
                {listing.seller.responseTime}
              </span>
            </div>
          ) : null}
          {showJoinedAt ? (
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
              <span className="font-medium text-muted">عضو منذ</span>
              <span className="font-semibold text-ink">
                {formatJoinedDate(listing.seller.joinedAt!)}
              </span>
            </div>
          ) : null}
          {showTransactions ? (
            <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
              <span className="font-medium text-muted">معاملات مكتملة</span>
              <span className="font-semibold text-ink">
                {listing.seller.completedTransactions!.toLocaleString("en-AE")}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
    </LocalizedTree>
  );
}
