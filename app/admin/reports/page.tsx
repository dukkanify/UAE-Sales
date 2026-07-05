import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminReportsPanel } from "@/features/admin/components/AdminReportsPanel";

export default function AdminReportsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/reports"
          description="تقارير النمو والإيرادات والضمان ومعدل النزاعات."
          title="التقارير"
        >
          <AdminReportsPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
