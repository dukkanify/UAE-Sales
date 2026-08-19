import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminOrdersPanel } from "@/features/admin/components/AdminOrdersPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminOrdersPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/orders"
      description="كل الطلبات مع معرفات Stripe وحالة الاسترداد — تحرّك بسرعة على الحالات الحرجة."
      title="الطلبات والمدفوعات"
    >
      <AdminOrdersPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
