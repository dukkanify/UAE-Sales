import { AdminReportsPanel } from "@/features/admin/components/AdminReportsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminReportsPage() {
  return (
    <AdminShell
      activePath="/admin/reports"
      description="حجم المدفوعات، رسوم المنصة، وسجل أحداث Stripe."
      title="تقارير الدفع"
    >
      <AdminReportsPanel />
    </AdminShell>
  );
}
