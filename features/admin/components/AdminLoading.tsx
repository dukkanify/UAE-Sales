import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";

export function AdminLoading() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="marketplace-stat-card p-6" variant="flat">
            <Skeleton height="0.75rem" width="40%" />
            <Skeleton className="mt-3" height="2rem" width="55%" />
          </Card>
        ))}
      </div>
      <Card className="marketplace-panel p-6" variant="flat">
        <Skeleton height="1rem" width="30%" />
        <div className="mt-4 grid gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="2.5rem" />
          ))}
        </div>
      </Card>
    </div>
  );
}
