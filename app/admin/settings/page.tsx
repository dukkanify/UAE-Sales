import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminSettingsPanel } from "@/features/admin/components/AdminSettingsPanel";

export default function AdminSettingsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/settings"
          description="إعدادات لوحة الإدارة والحساب التجريبي."
          title="الإعدادات"
        >
          <AdminSettingsPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
