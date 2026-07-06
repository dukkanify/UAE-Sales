import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  height?: string;
  width?: string;
};

export function Skeleton({
  className = "",
  height = "1rem",
  width = "100%",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`skeleton ${className}`}
      style={{ height, width }}
      {...props}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div aria-busy="true" aria-label="جاري تحميل الإعلان" className="marketplace-card flex h-full flex-col overflow-hidden">
      <div className="aspect-[4/3]">
        <Skeleton className="h-full w-full !rounded-none" />
      </div>
      <div className="min-h-[11rem] space-y-3 p-4">
        <Skeleton height="0.65rem" width="35%" />
        <Skeleton height="0.875rem" width="90%" />
        <Skeleton height="0.875rem" width="75%" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="!rounded-full" height="1.75rem" width="1.75rem" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
        <Skeleton height="0.75rem" width="55%" />
        <div className="flex justify-between border-t border-border/50 pt-3">
          <Skeleton height="0.75rem" width="4.5rem" />
          <Skeleton height="0.75rem" width="4rem" />
        </div>
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="marketplace-stat-card p-6">
          <Skeleton height="0.875rem" width="45%" />
          <Skeleton className="mt-3" height="2rem" width="55%" />
        </div>
      ))}
    </div>
  );
}

export function PageHeroSkeleton() {
  return (
    <div className="surface-gradient mb-8 h-36 animate-pulse rounded-[var(--radius-2xl)] md:mb-10 md:h-40" />
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      <Skeleton height="2.5rem" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} height="3rem" />
      ))}
    </div>
  );
}

export function DashboardShellSkeleton() {
  return (
    <section className="app-container page-padding">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="!rounded-[var(--radius-xl)]" height="2.25rem" width="6rem" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <div className="hidden lg:grid lg:gap-4">
          <div className="marketplace-panel p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="!rounded-[var(--radius-xl)]" height="2.75rem" width="2.75rem" />
              <div className="flex-1 space-y-2">
                <Skeleton height="0.75rem" width="70%" />
                <Skeleton height="0.65rem" width="50%" />
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} height="2.25rem" />
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-safe min-w-0">
          <PageHeroSkeleton />
          <StatCardsSkeleton count={2} />
          <div className="mt-5 marketplace-panel p-6">
            <DataTableSkeleton />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Skeleton className="aspect-[4/3] !rounded-[var(--radius-2xl)] lg:min-h-[28rem]" />
      <div className="grid gap-4">
        <div className="marketplace-panel p-6">
          <Skeleton height="0.75rem" width="30%" />
          <Skeleton className="mt-3" height="1.5rem" width="85%" />
          <Skeleton className="mt-4" height="2rem" width="40%" />
          <Skeleton className="mt-6" height="2.75rem" />
        </div>
        <div className="marketplace-panel p-6">
          <Skeleton height="1rem" width="50%" />
          <Skeleton className="mt-3" height="3rem" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="marketplace-panel grid gap-4 p-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-2">
          <Skeleton height="0.75rem" width="25%" />
          <Skeleton height="2.75rem" />
        </div>
      ))}
      <Skeleton className="mt-2" height="2.75rem" width="8rem" />
    </div>
  );
}
