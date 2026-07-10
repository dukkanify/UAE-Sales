import { ListingCardSkeleton } from "@/shared/ui/Skeleton";

export default function ListingLoading() {
  return (
    <div className="app-container page-padding">
      <div className="mb-6 h-6 w-48 animate-pulse rounded-[var(--radius-md)] bg-surface-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-2xl)] bg-surface-muted lg:min-h-[32rem]" />
        <div className="grid gap-4">
          <div className="h-64 animate-pulse rounded-[var(--radius-2xl)] bg-surface-muted" />
          <ListingCardSkeleton />
        </div>
      </div>
    </div>
  );
}
