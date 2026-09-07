import { CheckoutSuccessContent } from "@/features/checkout/components/CheckoutSuccessContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
    token?: string;
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;

  if (!params.orderId && !params.session_id) {
    return (
      <>
        <SiteHeader />
        <main>
          <section className="app-container page-padding">
            <p className="text-sm text-muted">لم يتم العثور على رقم الطلب.</p>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main>
        <CheckoutSuccessContent
          guestToken={params.token}
          orderId={params.orderId}
          sessionId={params.session_id}
        />
      </main>
      <SiteFooter />
    </>
  );
}
