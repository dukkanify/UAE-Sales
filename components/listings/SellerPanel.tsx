import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type SellerPanelProps = {
  listing: Listing;
};

export function SellerPanel({ listing }: SellerPanelProps) {
  const isVerified = listing.seller.rating >= 4.8;

  return (
    <Card className="p-6">
      <h2 className="text-base font-black text-ink">البائع</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-[var(--radius-xl)] bg-primary text-sm font-semibold text-white">
          {listing.seller.name.slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{listing.seller.name}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-muted">
            <Icon className="text-secondary" name="star" size={14} />
            {listing.seller.rating}
          </p>
        </div>
        {isVerified ? <Badge variant="verified">موثق</Badge> : null}
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">الرد</span>
          <span className="font-semibold text-ink">خلال ساعة</span>
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">عضو منذ</span>
          <span className="font-semibold text-ink">2024</span>
        </div>
      </div>
    </Card>
  );
}
