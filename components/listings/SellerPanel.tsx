import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type SellerPanelProps = {
  listing: Listing;
};

export function SellerPanel({ listing }: SellerPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-base font-black text-ink">البائع</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-[var(--radius-md)] bg-primary text-sm font-black text-white">
          {listing.seller.name.slice(0, 2)}
        </span>
        <div>
          <p className="font-bold text-ink">{listing.seller.name}</p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-muted">
            <Icon className="text-secondary" name="star" size={14} />
            {listing.seller.rating}
          </p>
        </div>
        {listing.seller.rating >= 4.8 ? (
          <Badge className="mr-auto" variant="success">
            موثق
          </Badge>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">الرد</span>
          <span className="font-bold text-ink">خلال ساعة</span>
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-surface-muted px-4 py-3">
          <span className="font-medium text-muted">عضو منذ</span>
          <span className="font-bold text-ink">2024</span>
        </div>
      </div>
    </Card>
  );
}
