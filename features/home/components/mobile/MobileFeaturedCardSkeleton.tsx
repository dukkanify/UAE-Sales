import { Skeleton } from "@/shared/ui/Skeleton";

export function MobileFeaturedCardSkeleton() {
  return (
    <article
      aria-busy="true"
      aria-label="جاري تحميل الإعلان"
      className="mobile-home-featured-card"
    >
      <Skeleton className="aspect-[4/3] w-full !rounded-none" />
      <div className="space-y-2 p-3.5">
        <Skeleton height="1rem" width="45%" />
        <Skeleton height="0.875rem" width="90%" />
        <Skeleton height="0.875rem" width="70%" />
        <Skeleton height="0.6875rem" width="60%" />
        <div className="flex justify-between border-t border-[var(--mh-border)] pt-2.5">
          <Skeleton className="!rounded-full" height="1.25rem" width="3.5rem" />
          <Skeleton height="0.75rem" width="2.5rem" />
        </div>
      </div>
    </article>
  );
}
