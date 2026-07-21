import { AdminOpsCockpit } from "@/features/admin/components/AdminOpsCockpit";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activePath="/admin"
      description="نبض السوق بين يديك — تقارير، تحليلات، مدفوعات Stripe، وإشراف كامل من غرفة قيادة واحدة."
      title="غرفة قيادة سوقنا"
    >
      <AdminOpsCockpit />
    </AdminShell>
  );
}
