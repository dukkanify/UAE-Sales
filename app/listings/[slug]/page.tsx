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
import { getListingBySlug, getRelatedListings } from "@/services/listings";
import { listingDescription, listingTitle } from "@/shared/i18n/listing-copy";
import { getRequestLocale } from "@/shared/i18n/locale";
import { tx } from "@/shared/i18n/tx";

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
  const locale = await getRequestLocale();
  if (!listing) {
    return {
      title: tx(locale, "الإعلان غير موجود"),
    };
  }
  const title = listingTitle(listing, locale);
  const description = listingDescription(listing, locale).slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      description,
      locale: locale === "en" ? "en_AE" : "ar_AE",
      title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      description,
      title,
    },
  };
}

export default async function ListingDetailsPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const locale = await getRequestLocale();
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
            { href: "/", label: tx(locale, "الرئيسية") },
            { href: "/search", label: tx(locale, "الإعلانات") },
            ...(category
              ? [{ href: `/categories/${category.slug}`, label: tx(locale, category.name) }]
              : []),
            { label: listingTitle(listing, locale) },
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
