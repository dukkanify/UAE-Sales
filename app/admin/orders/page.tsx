import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminOrdersPanel } from "@/features/admin/components/AdminOrdersPanel";

export default function AdminOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/orders"
          description="متابعة جميع الطلبات وحالات الدفع والضمان."
          title="إدارة الطلبات"
        >
          <AdminOrdersPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
