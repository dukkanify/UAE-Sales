import { AdminStripeConnectPanel } from "@/features/admin/components/AdminStripeConnectPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminStripeRefreshPage() {
  return (
    <AdminShell
      activePath="/admin/stripe"
      description="انتهت صلاحية رابط الإعداد — جارٍ إنشاء رابط جديد."
      title="تحديث رابط Stripe"
    >
      <AdminStripeConnectPanel mode="refresh" />
    </AdminShell>
  );
}
