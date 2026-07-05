import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EscrowProtectionCard } from "@/features/listings/components/EscrowProtectionCard";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { ListingSummary } from "@/features/listings/components/ListingSummary";
import { SellerPanel } from "@/features/listings/components/SellerPanel";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { Card } from "@/shared/ui/Card";
import { SectionHeader } from "@/shared/ui/SectionHeader";
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
  if (!listing) return { title: "الإعلان غير موجود | UAE Sales" };
  return {
    title: `${listing.title} | UAE Sales`,
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
      <main>
        <section className="app-container page-padding">
          <Breadcrumbs
            items={[
              { href: "/", label: "الرئيسية" },
              { href: "/search", label: "الإعلانات" },
              ...(category
                ? [
                    {
                      href: `/categories/${category.slug}`,
                      label: category.name,
                    },
                  ]
                : []),
              { label: listing.title },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ListingGallery listing={listing} />
            <div className="grid gap-4">
              <ListingSummary category={category} listing={listing} />
              <SellerPanel listing={listing} />
              <EscrowProtectionCard />
            </div>
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-lg font-black text-ink">وصف الإعلان</h2>
            <p className="mt-4 text-sm font-medium leading-8 text-muted">
              {listing.description}
            </p>
          </Card>
        </section>

        {relatedListings.length > 0 ? (
          <section className="app-container page-padding">
            <SectionHeader
              description="إعلانات من نفس التصنيف قد تعجبك."
              eyebrow="مشابه"
              title="قد يعجبك أيضاً"
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {relatedListings.map((relatedListing) => (
                <ListingCard
                  key={relatedListing.id}
                  categoryName={category?.name}
                  listing={relatedListing}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
