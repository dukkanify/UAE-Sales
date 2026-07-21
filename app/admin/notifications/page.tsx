import { AdminNotificationsPanel } from "@/features/admin/components/AdminNotificationsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminNotificationsPage() {
  return (
    <AdminShell
      activePath="/admin/notifications"
      description="كل إشعارات النظام المرتبطة بالطلبات والضمان والوارد من بيانات الموقع الحية."
      title="الإشعارات"
    >
      <AdminNotificationsPanel />
    </AdminShell>
  );
}
