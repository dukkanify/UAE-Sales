import type { ListingStatus } from "@/types";
import { listingStatusLabels } from "@/shared/constants/listingStatuses";
import { Badge } from "@/shared/ui/Badge";

type ListingStatusBadgeProps = {
  status: ListingStatus;
};

const statusVariants: Record<
  ListingStatus,
  "new" | "muted" | "pending" | "sold" | "rejected"
> = {
  active: "new",
  draft: "muted",
  expired: "sold",
  pending_review: "pending",
  rejected: "rejected",
};

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {listingStatusLabels[status]}
    </Badge>
  );
}
