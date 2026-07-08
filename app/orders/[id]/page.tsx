import { OrderDetailContent } from "@/features/orders/components/OrderDetailContent";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";

type OrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { payment } = await searchParams;
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="تفاصيل الطلب وحالة الضمان."
          title="تفاصيل الطلب"
          user={user}
        >
          <OrderDetailContent
            orderId={id}
            paymentSuccess={payment === "success"}
          />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
