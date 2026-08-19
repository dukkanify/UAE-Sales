import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminReportsPanel } from "@/features/admin/components/AdminReportsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminReportsPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/reports"
      description="تقارير مالية تفصيلية: الحجم، الرسوم، التحويل، المحافظ، وسجل أحداث الدفع."
      title="التقارير المالية"
    >
      <AdminReportsPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
