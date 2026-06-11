import { LocalListingEdit } from "@/components/listings/LocalListingEdit";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

type LocalListingEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LocalListingEditPage({
  params,
}: LocalListingEditPageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="app-container py-12">
        <LocalListingEdit listingId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
