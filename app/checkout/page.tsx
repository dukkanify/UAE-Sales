import { CheckoutContent } from "@/features/checkout/components/CheckoutContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getListingBySlug } from "@/services/listings";

type CheckoutPageProps = {
  searchParams: Promise<{
    listing?: string;
    listingId?: string;
    payment?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const listingRef = params.listingId ?? params.listing;
  const catalogListing =
    listingRef && !listingRef.startsWith("local-")
      ? await getListingBySlug(listingRef)
      : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutContent
          catalogListing={catalogListing}
          listingRef={listingRef}
          paymentCancelled={params.payment === "cancelled"}
        />
      </main>
      <SiteFooter />
    </>
  );
}
