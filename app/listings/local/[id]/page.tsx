import { LocalListingDetails } from "@/components/listings/LocalListingDetails";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";

type LocalListingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LocalListingPage({
  params,
}: LocalListingPageProps) {
  const [{ id }, categories] = await Promise.all([params, getCategories()]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container py-8 lg:py-12">
          <LocalListingDetails categories={categories} listingId={id} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
