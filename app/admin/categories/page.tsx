import { AdminCategoriesPanel } from "@/features/admin/components/AdminCategoriesPanel";
import {
  AdminShell,
  type AdminPath,
} from "@/features/admin/components/AdminShell";

export default function AdminCategoriesPage() {
  return (
    <AdminShell
      activePath={"/admin/categories" as AdminPath}
      description="إدارة فئات السوق — تفعيل، تعطيل، وإضافة فئات جديدة."
      title="الفئات"
    >
      <AdminCategoriesPanel />
    </AdminShell>
  );
}
