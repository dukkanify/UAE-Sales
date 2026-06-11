import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EscrowProtectionCard } from "@/components/listings/EscrowProtectionCard";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingSummary } from "@/components/listings/ListingSummary";
import { SellerPanel } from "@/components/listings/SellerPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import {
  getListingBySlug,
  getListings,
  getRelatedListings,
} from "@/services/listingsService";

type ListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const listings = await getListings();

  return listings.map((listing) => ({
    slug: listing.slug,
  }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "الإعلان غير موجود | UAE Sales",
    };
  }

  return {
    title: `${listing.title} | UAE Sales`,
    description: listing.description,
  };
}

export default async function ListingDetailsPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const [categories, relatedListings] = await Promise.all([
    getCategories(),
    getRelatedListings(listing.categoryId, listing.id),
  ]);
  const category = categories.find((item) => item.id === listing.categoryId);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container py-8 lg:py-12">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-muted">
            <Link href="/" className="transition hover:text-primary">
              الرئيسية
            </Link>
            <span>/</span>
            <Link href="/search" className="transition hover:text-primary">
              الإعلانات
            </Link>
            {category ? (
              <>
                <span>/</span>
                <Link
                  href={`/search?category=${category.id}`}
                  className="transition hover:text-primary"
                >
                  {category.name}
                </Link>
              </>
            ) : null}
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ListingGallery listing={listing} />
            <div className="grid gap-5">
              <ListingSummary category={category} listing={listing} />
              <SellerPanel listing={listing} />
              <EscrowProtectionCard />
            </div>
          </div>

          <div className="mt-10 grid gap-5 rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-card)] lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <h2 className="text-2xl font-black text-ink">وصف الإعلان</h2>
              <p className="mt-3 text-sm font-bold text-muted">
                تفاصيل قابلة للتوسعة لاحقاً لعرض المواصفات الفنية والأسئلة
                الشائعة.
              </p>
            </div>
            <p className="leading-9 text-muted">{listing.description}</p>
          </div>
        </section>

        {relatedListings.length > 0 ? (
          <section className="app-container py-10">
            <SectionHeader
              eyebrow="إعلانات مشابهة"
              title="قد يعجبك أيضاً"
              description="اقتراحات من نفس التصنيف لتسهيل التصفح والانتقال بين الإعلانات."
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
