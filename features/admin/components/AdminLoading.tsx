import { Card } from "@/shared/ui/Card";
import { DataTableSkeleton, StatCardsSkeleton } from "@/shared/ui/Skeleton";

export function AdminLoading() {
  return (
    <div className="grid gap-4">
      <StatCardsSkeleton />
      <Card className="p-6" variant="panel">
        <DataTableSkeleton rows={6} />
      </Card>
    </div>
  );
}
