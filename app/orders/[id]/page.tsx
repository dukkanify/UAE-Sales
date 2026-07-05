import { notFound } from "next/navigation";
import { OrderDetailPanel } from "@/features/orders/components/OrderDetailPanel";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getOrderById } from "@/services/orders";
import { getCurrentUser } from "@/services/profile";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const [user, order] = await Promise.all([
    getCurrentUser(),
    getOrderById(id),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/orders"
          description={`طلب #${order.orderNumber} — ${order.listingTitle}`}
          title="تفاصيل الطلب"
          user={user}
        >
          <OrderDetailPanel order={order} />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
