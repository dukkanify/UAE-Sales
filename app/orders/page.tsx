import { OrdersListContent } from "@/features/orders/components/OrdersListContent";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/orders"
          description="طلباتك كمشتري أو بائع — تابع حالة الدفع والتسليم."
          title="طلباتي"
          user={user}
        >
          <OrdersListContent />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
