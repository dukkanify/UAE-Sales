import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminEscrowPanel } from "@/features/admin/components/AdminEscrowPanel";

export default function AdminEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/escrow"
          description="إدارة معاملات الضمان والإطلاق والاسترداد اليدوي."
          title="إدارة الضمان"
        >
          <AdminEscrowPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
