import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function ChatLoading() {
  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <Card className="p-4" variant="panel">
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="!rounded-full" height="3rem" width="3rem" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton height="0.75rem" width="60%" />
                    <Skeleton height="0.65rem" width="90%" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="min-h-[24rem] p-6" variant="panel">
            <Skeleton height="1rem" width="40%" />
            <Skeleton className="mt-6" height="12rem" />
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
