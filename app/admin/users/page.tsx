import { AdminUsersPanel } from "@/features/admin/components/AdminUsersPanel";
import {
  AdminShell,
  type AdminPath,
} from "@/features/admin/components/AdminShell";

export default function AdminUsersPage() {
  return (
    <AdminShell
      activePath={"/admin/users" as AdminPath}
      description="إدارة المستخدمين — توثيق الحسابات وإيقاف المخالفين."
      title="المستخدمون"
    >
      <AdminUsersPanel />
    </AdminShell>
  );
}
