import { ListingCardSkeleton } from "@/shared/ui/Skeleton";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function RootLoading() {
  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <div className="surface-gradient mb-8 h-40 animate-pulse rounded-[var(--radius-2xl)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ListingCardSkeleton key={index} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
