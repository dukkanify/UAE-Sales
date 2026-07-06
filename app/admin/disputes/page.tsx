import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminDisputesPanel } from "@/features/admin/components/AdminDisputesPanel";

export default function AdminDisputesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/disputes"
          description="مراجعة النزاعات واتخاذ قرارات الإدارة."
          title="إدارة النزاعات"
        >
          <AdminDisputesPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
