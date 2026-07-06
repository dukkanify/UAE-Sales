import { ListingCardSkeleton, PageHeroSkeleton } from "@/shared/ui/Skeleton";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function RootLoading() {
  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <PageHeroSkeleton />
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
