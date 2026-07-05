import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminCategoriesPanel } from "@/features/admin/components/AdminCategoriesPanel";

export default function AdminCategoriesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminShell
          activePath="/admin/categories"
          description="إدارة تصنيفات السوق وعدد الإعلانات لكل قسم."
          title="إدارة التصنيفات"
        >
          <AdminCategoriesPanel />
        </AdminShell>
      </main>
      <SiteFooter />
    </>
  );
}
