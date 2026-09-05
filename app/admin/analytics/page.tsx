import { AdminAnalyticsPanel } from "@/features/admin/components/AdminAnalyticsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell
      activePath="/admin/analytics"
      description="اتجاهات الحجم، التحويل، حالات الطلبات والدفع، وأعلى التصنيفات."
      title="التحليلات"
    >
      <AdminAnalyticsPanel />
    </AdminShell>
  );
}
