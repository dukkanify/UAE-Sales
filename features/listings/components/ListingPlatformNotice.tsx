import type { Listing } from "@/types";
import { INTERMEDIARY_NOTICE, showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingPlatformNoticeProps = {
  listing: Listing;
};

export function ListingPlatformNotice({ listing }: ListingPlatformNoticeProps) {
  if (showsEscrowProtection(listing)) {
    return null;
  }

  return (
    <Card className="marketplace-panel p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-[var(--radius-xl)] bg-surface-muted text-muted">
          <Icon name="message" size={18} />
        </span>
        <h2 className="text-base font-black text-ink">إعلان عادي — بدون ضمان مالي</h2>
      </div>
      <p className="mt-4 text-sm font-medium leading-7 text-muted">{INTERMEDIARY_NOTICE}</p>
    </Card>
  );
}
