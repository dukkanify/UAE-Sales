import type { ListingStatus } from "@/types";
import { listingStatusLabels } from "@/constants/listingStatuses";
import { Badge } from "@/components/ui/Badge";

type ListingStatusBadgeProps = {
  status: ListingStatus;
};

const statusVariants: Record<
  ListingStatus,
  "success" | "muted" | "warning" | "accent" | "default"
> = {
  active: "success",
  draft: "muted",
  expired: "warning",
  pending_review: "default",
  rejected: "accent",
};

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {listingStatusLabels[status]}
    </Badge>
  );
}
