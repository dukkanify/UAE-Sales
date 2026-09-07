import { AdminUsersPanel } from "@/features/admin/components/AdminUsersPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminUsersPage() {
  return (
    <AdminShell
      activePath="/admin/users"
      description="اعتماد الحسابات بعد التحقق من الشخص، توثيق البائعين، وإيقاف المخالفين."
      title="المستخدمون"
    >
      <AdminUsersPanel />
    </AdminShell>
  );
}
