import type { Listing } from "@/types";
import { listingStatusDescriptions } from "@/shared/constants/listingStatuses";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { ListingStatusBadge } from "@/features/listings/components/ListingStatusBadge";

type ListingReviewBannerProps = {
  listing: Listing;
};

export function ListingReviewBanner({ listing }: ListingReviewBannerProps) {
  if (listing.status === "active") return null;

  const tone =
    listing.status === "rejected"
      ? "border-error/30 bg-error-soft/50"
      : listing.status === "pending_review"
        ? "border-secondary/40 bg-secondary-soft/40"
        : "border-border bg-surface-muted";

  return (
    <Card className={`mb-4 p-4 ${tone}`} variant="flat">
      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-2xl bg-[#0b1628] text-secondary">
          <Icon name="shield" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-ink">معاينة خاصة — لم يُنشر بعد</p>
            <ListingStatusBadge status={listing.status} />
          </div>
          <p className="mt-1 text-sm leading-7 text-muted">
            {listingStatusDescriptions[listing.status]}
          </p>
          {listing.status === "rejected" && listing.rejectionReason ? (
            <p className="mt-2 rounded-[var(--radius-xl)] bg-surface px-3 py-2 text-sm text-ink">
              <span className="font-bold">سبب الرفض: </span>
              {listing.rejectionReason}
            </p>
          ) : null}
          {listing.status === "pending_review" && listing.submittedAt ? (
            <p className="mt-1 text-xs text-muted">
              أُرسل في {new Date(listing.submittedAt).toLocaleString("ar-AE")}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
