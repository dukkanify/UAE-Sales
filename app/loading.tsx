import { PageSkeleton } from "@/components/shared/loading-state";

export default function Loading() {
  return (
    <div className="container-app py-10">
      <PageSkeleton />
    </div>
  );
}
