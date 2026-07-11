import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailsView } from "@/features/listings/components/ListingDetailsView";
import {
  RecentlyViewedSection,
  RecentlyViewedTracker,
} from "@/features/listings/components/RecentlyViewedSection";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import {
  getListingBySlug,
  getRelatedListings,
} from "@/services/listings";

type ListingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getListings, getMyListings } = await import("@/services/listings");
  const [listings, userListings] = await Promise.all([
    getListings(),
    getMyListings(),
  ]);
  return [...listings, ...userListings].map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: `الإعلان غير موجود | Sooqna` };
  return {
    title: `${listing.title} | Sooqna`,
    description: listing.description,
  };
}

export default async function ListingDetailsPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const [categories, relatedListings] = await Promise.all([
    getCategories(),
    getRelatedListings(listing.categoryId, listing.id),
  ]);
  const category = categories.find((item) => item.id === listing.categoryId);

  return (
    <>
      <SiteHeader />
      <RecentlyViewedTracker listing={listing} />
      <main>
        <ListingDetailsView
          breadcrumbs={[
            { href: "/", label: "الرئيسية" },
            { href: "/search", label: "الإعلانات" },
            ...(category
              ? [{ href: `/categories/${category.slug}`, label: category.name }]
              : []),
            { label: listing.title },
          ]}
          category={category}
          listing={listing}
          relatedListings={relatedListings}
        />
        <RecentlyViewedSection
          categories={categories}
          currentSlug={listing.slug}
          listings={[listing, ...relatedListings]}
        />
      </main>
      <SiteFooter />
    </>
  );
}
