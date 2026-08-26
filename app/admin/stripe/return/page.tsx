import { AdminStripeConnectPanel } from "@/features/admin/components/AdminStripeConnectPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminStripeReturnPage() {
  return (
    <AdminShell
      activePath="/admin/stripe"
      description="تم الرجوع من Stripe — نتحقق من حالة الحساب على الخادم."
      title="عودة من Stripe"
    >
      <AdminStripeConnectPanel mode="return" />
    </AdminShell>
  );
}
