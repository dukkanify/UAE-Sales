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
    <div className="marketplace-card flex h-full flex-col overflow-hidden">
      <div className="aspect-[4/3]">
        <Skeleton className="h-full w-full !rounded-none" />
      </div>
      <div className="min-h-[9.5rem] space-y-3 p-4">
        <Skeleton height="0.65rem" width="35%" />
        <Skeleton height="0.875rem" width="90%" />
        <Skeleton height="0.875rem" width="75%" />
        <Skeleton height="0.75rem" width="50%" />
        <div className="flex justify-between pt-2">
          <Skeleton height="1.25rem" width="5.5rem" />
          <Skeleton height="0.75rem" width="4rem" />
        </div>
      </div>
    </div>
  );
}
