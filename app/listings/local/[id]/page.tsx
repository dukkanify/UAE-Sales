import { LocalListingDetails } from "@/features/listings/components/LocalListingDetails";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";

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
        <section className="app-container page-padding">
          <LocalListingDetails categories={categories} listingId={id} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
