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
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <Skeleton className="!rounded-none" height="12rem" />
      <div className="space-y-3 p-4">
        <Skeleton height="0.875rem" width="80%" />
        <Skeleton height="0.875rem" width="55%" />
        <div className="flex justify-between pt-2">
          <Skeleton height="1.25rem" width="5rem" />
          <Skeleton height="0.75rem" width="3rem" />
        </div>
      </div>
    </div>
  );
}
