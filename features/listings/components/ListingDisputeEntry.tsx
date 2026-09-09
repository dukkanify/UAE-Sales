"use client";

import type { Listing } from "@/types";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { getListingDisputePath } from "@/shared/listings/listing-url";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingDisputeEntryProps = {
  compact?: boolean;
  listing: Listing;
};

export function ListingDisputeEntry({
  compact = false,
  listing,
}: ListingDisputeEntryProps) {
  const href = getListingDisputePath(listing);
  const escrow = showsEscrowProtection(listing);

  if (compact) {
    return (
      <Button className="!min-h-9" href={href} size="sm" variant="secondary">
        <Icon name="shield" size={14} />
        فتح نزاع
      </Button>
    );
  }

  return (
    <Card className="marketplace-panel mt-4 w-full min-w-0 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-warning-soft text-warning">
          <Icon name="shield" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-ink">فتح نزاع</h2>
          <p className="mt-1 text-sm font-medium leading-7 text-muted">
            {escrow
              ? "إذا اشتريت هذا الإعلان عبر الضمان المالي ولم يطابق الاتفاق، افتح نزاعاً من هنا خلال المهلة المحددة."
              : "النزاع متاح للطلبات المدفوعة عبر الضمان. من هنا تختار طلبك على هذا الإعلان وتفتح النزاع."}
          </p>
          <div className="mt-3">
            <Button href={href} size="sm" variant="secondary">
              <Icon name="shield" size={14} />
              فتح نزاع
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
