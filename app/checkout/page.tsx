import { notFound } from "next/navigation";
import { CheckoutAuthGate } from "@/features/checkout/components/CheckoutAuthGate";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getListingById } from "@/services/listings";
import { getCurrentUser } from "@/services/profile";

type CheckoutPageProps = {
  searchParams: Promise<{ listingId?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { listingId } = await searchParams;

  if (!listingId) {
    notFound();
  }

  const [listing, user] = await Promise.all([
    getListingById(listingId),
    getCurrentUser(),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutAuthGate listingId={listingId}>
          <CheckoutForm listing={listing} user={user} />
        </CheckoutAuthGate>
      </main>
      <SiteFooter />
    </>
  );
}
