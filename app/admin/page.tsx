import { AdminOpsCockpit } from "@/features/admin/components/AdminOpsCockpit";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      activePath="/admin"
      description="نظرة تشغيلية شاملة على المدفوعات، الإشراف، والوارد — مع وصول مباشر لكل وحدة."
      title="لوحة التحكم"
    >
      <AdminOpsCockpit />
    </AdminShell>
  );
}
