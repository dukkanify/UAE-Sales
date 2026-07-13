import type { Listing } from "@/types";
import { showsEscrowProtection } from "@/shared/listings/escrow-eligibility";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { getEscrowProtectionSteps } from "@/services/content";

type EscrowProtectionCardProps = {
  listing: Listing;
};

export async function EscrowProtectionCard({ listing }: EscrowProtectionCardProps) {
  if (!showsEscrowProtection(listing)) {
    return null;
  }

  const protectionSteps = await getEscrowProtectionSteps();

  return (
    <Card className="marketplace-panel p-6">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-[var(--radius-xl)] bg-success-soft text-success">
          <Icon name="shield" size={18} />
        </span>
        <div>
          <h2 className="text-base font-black text-ink">حماية الدفع</h2>
          <Badge className="mt-1" variant="escrow">
            ضمان مالي — دفع عبر المنصة
          </Badge>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium leading-7 text-muted">
        يُفعَّل الضمان المالي فقط عند شراء هذا الإعلان والدفع بالكامل عبر نظام الدفع
        المدمج في المنصة. يُحجز المبلغ بأمان حتى تأكيد الاستلام.
      </p>
      <ol className="mt-4 grid gap-2">
        {protectionSteps.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3 text-sm font-medium text-ink"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary text-xs font-semibold text-white">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Card>
  );
}
