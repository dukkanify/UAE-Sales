import type { Listing } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type SellerPanelProps = {
  listing: Listing;
};

function formatJoinedDate(joinedAt?: string): string {
  if (!joinedAt) return "—";
  const year = new Date(joinedAt).getFullYear();
  return Number.isFinite(year) ? String(year) : joinedAt;
}

export function SellerPanel({ listing }: SellerPanelProps) {
  const isVerified =
    listing.verifiedSeller ?? listing.seller.isVerified ?? listing.seller.rating >= 4.8;
  const sellerTypeLabel =
    listing.seller.sellerType === "business" ? "شركة" : "بائع فردي";

  return (
    <Card className="marketplace-panel p-6">
      <h2 className="text-base font-black text-ink">البائع</h2>
      <div className="mt-4 flex items-center gap-3">
        {listing.seller.avatarUrl ? (
          <span className="relative size-12 overflow-hidden rounded-[var(--radius-xl)]">
            <AppImage
              alt={listing.seller.name}
              className="object-cover"
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
          <p className="font-semibold text-ink">{listing.seller.name}</p>
          <p className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-sm font-medium text-muted">
            <Icon className="text-secondary" name="star" size={14} />
            {listing.seller.rating}
            {listing.seller.reviewCount ? (
              <>
                <span className="text-border">·</span>
                {listing.seller.reviewCount.toLocaleString("ar-AE")} تقييم
              </>
            ) : null}
          </p>
          <p className="mt-0.5 text-xs font-medium text-muted">{sellerTypeLabel}</p>
        </div>
        {isVerified ? <Badge variant="verified">موثق</Badge> : null}
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">الرد</span>
          <span className="font-semibold text-ink">
            {listing.seller.responseTime ?? "خلال ساعة"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">عضو منذ</span>
          <span className="font-semibold text-ink">
            {formatJoinedDate(listing.seller.joinedAt)}
          </span>
        </div>
        {typeof listing.seller.completedTransactions === "number" ? (
          <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
            <span className="font-medium text-muted">معاملات مكتملة</span>
            <span className="font-semibold text-ink">
              {listing.seller.completedTransactions.toLocaleString("ar-AE")}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
