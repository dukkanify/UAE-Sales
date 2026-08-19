import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminCategoriesPanel } from "@/features/admin/components/AdminCategoriesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminCategoriesPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/categories"
      description="إدارة أقسام السوق وتفعيلها أو إيقافها."
      title="التصنيفات"
    >
      <AdminCategoriesPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
