import { redirect } from "next/navigation";
import { CheckoutWizard } from "@/features/checkout/components/CheckoutWizard";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getListingActionConfig } from "@/shared/constants/listingActionConfig";
import { getListingBySlug } from "@/services/listings";
import { getListingPath } from "@/shared/listings/listing-url";

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

  if (catalogListing && !getListingActionConfig(catalogListing).checkoutEnabled) {
    redirect(getListingPath(catalogListing));
  }

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutWizard
          catalogListing={catalogListing}
          listingRef={listingRef}
          paymentCancelled={params.payment === "cancelled"}
        />
      </main>
      <SiteFooter />
    </>
  );
}
