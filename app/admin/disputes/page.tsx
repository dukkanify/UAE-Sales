import { AdminDisputesPanel } from "@/features/admin/components/AdminDisputesPanel";
import {
  AdminShell,
  type AdminPath,
} from "@/features/admin/components/AdminShell";

export default function AdminDisputesPage() {
  return (
    <AdminShell
      activePath={"/admin/disputes" as AdminPath}
      description="النزاعات المفتوحة وقرارات الضمان — راجع الأسباب وأصدر الحكم بسرعة."
      title="النزاعات"
    >
      <AdminDisputesPanel />
    </AdminShell>
  );
}
