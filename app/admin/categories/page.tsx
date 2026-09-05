import { AdminCategoriesPanel } from "@/features/admin/components/AdminCategoriesPanel";
import { AdminCategoryFormsPanel } from "@/features/admin/components/AdminCategoryFormsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminCategoriesPage() {
  return (
    <AdminShell
      activePath="/admin/categories"
      description="إدارة أقسام السوق وتفعيلها أو إيقافها، مع منشئ النماذج الديناميكية."
      title="التصنيفات"
    >
      <div className="grid gap-6">
        <AdminCategoriesPanel />
        <AdminCategoryFormsPanel />
      </div>
    </AdminShell>
  );
}
