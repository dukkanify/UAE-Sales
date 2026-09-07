import { AdminStripePanel } from "@/features/admin/components/AdminStripePanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminStripePage() {
  return (
    <AdminShell
      activePath="/admin/stripe"
      description="ربط Stripe Connect، حالة التفعيل، مفاتيح المنصة، والطلبات المرتبطة."
      title="إدارة Stripe"
    >
      <AdminStripePanel />
    </AdminShell>
  );
}
