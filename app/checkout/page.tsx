import { CheckoutContent } from "@/features/checkout/components/CheckoutContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getListingBySlug } from "@/services/listings";

type CheckoutPageProps = {
  searchParams: Promise<{ listing?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { listing: listingRef } = await searchParams;
  const catalogListing =
    listingRef && !listingRef.startsWith("local-")
      ? await getListingBySlug(listingRef)
      : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutContent catalogListing={catalogListing} listingRef={listingRef} />
      </main>
      <SiteFooter />
    </>
  );
}
