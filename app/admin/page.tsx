import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminDashboardPanel } from "@/features/admin/components/AdminDashboardPanel";

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin"
          description="نظرة شاملة على أداء المنصة والمعاملات والنزاعات."
          title="لوحة الإدارة"
        >
          <AdminDashboardPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
