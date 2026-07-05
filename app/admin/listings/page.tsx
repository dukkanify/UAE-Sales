import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminListingsPanel } from "@/features/admin/components/AdminListingsPanel";

export default function AdminListingsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/listings"
          description="مراجعة الإعلانات والموافقة والرفض والتمييز."
          title="إدارة الإعلانات"
        >
          <AdminListingsPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
