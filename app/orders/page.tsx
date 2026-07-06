import { OrdersList } from "@/features/orders/components/OrdersList";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getOrders } from "@/services/orders";
import { getCurrentUser } from "@/services/profile";

export default async function OrdersPage() {
  const [user, orders] = await Promise.all([getCurrentUser(), getOrders()]);

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/orders"
          description="متابعة طلبات الشراء والبيع وحالة الضمان المالي."
          title="طلباتي"
          user={user}
        >
          <OrdersList orders={orders} />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
