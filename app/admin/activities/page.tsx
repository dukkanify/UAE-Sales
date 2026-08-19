import { Suspense } from "react";
import { AdminActivitiesPanel } from "@/features/admin/components/AdminActivitiesPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminActivitiesPage() {
  return (
    <AdminShell
      activePath="/admin/activities"
      description="إدارة موحدة لطلبات الوظائف والحجوزات والخدمات والطلبات والإعلانات."
      title="إدارة الأنشطة"
    >
      <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
        <AdminActivitiesPanel />
      </Suspense>
    </AdminShell>
  );
}
