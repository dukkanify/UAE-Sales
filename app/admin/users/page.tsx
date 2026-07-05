import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminUsersPanel } from "@/features/admin/components/AdminUsersPanel";

export default function AdminUsersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/users"
          description="إدارة حسابات المستخدمين والتحقق والإيقاف."
          title="إدارة المستخدمين"
        >
          <AdminUsersPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
