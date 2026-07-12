import { OrderStatusContent } from "@/features/checkout/components/OrderStatusContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type OrderStatusPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function OrderStatusPage({ searchParams }: OrderStatusPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main>
        <OrderStatusContent token={params.token} />
      </main>
      <SiteFooter />
    </>
  );
}
