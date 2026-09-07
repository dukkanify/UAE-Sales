import { AdminAuditPanel } from "@/features/admin/components/AdminAuditPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminAuditPage() {
  return (
    <AdminShell
      activePath="/admin/audit"
      description="سجل إجراءات المدير: تحرير ضمان، استرداد، تحديث حالات الوارد، والإعدادات."
      title="سجل العمليات"
    >
      <AdminAuditPanel />
    </AdminShell>
  );
}
