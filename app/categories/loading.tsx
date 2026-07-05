import { ListingCardSkeleton } from "@/shared/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="app-container page-padding">
      <div className="surface-gradient mb-8 h-36 animate-pulse rounded-[var(--radius-2xl)]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
