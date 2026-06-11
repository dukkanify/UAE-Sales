import type { ListingStatus } from "@/types";
import { listingStatusLabels } from "@/constants/listingStatuses";

type ListingStatusBadgeProps = {
  status: ListingStatus;
};

const statusClasses: Record<ListingStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-100 text-slate-700",
  expired: "bg-amber-100 text-amber-800",
  pending_review: "bg-sky-100 text-sky-800",
  rejected: "bg-rose-100 text-rose-800",
};

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${statusClasses[status]}`}
    >
      {listingStatusLabels[status]}
    </span>
  );
}
