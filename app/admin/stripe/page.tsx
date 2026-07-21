import { AdminStripePanel } from "@/features/admin/components/AdminStripePanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminStripePage() {
  return (
    <AdminShell
      activePath="/admin/stripe"
      description="حالة الربط، روابط لوحة Stripe، الطلبات المرتبطة، وسجل أحداث الدفع."
      title="إدارة Stripe"
    >
      <AdminStripePanel />
    </AdminShell>
  );
}
