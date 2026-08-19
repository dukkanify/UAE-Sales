import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminAnalyticsPanel } from "@/features/admin/components/AdminAnalyticsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminAnalyticsPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/analytics"
      description="اتجاهات الحجم، التحويل، حالات الطلبات والدفع، وأعلى التصنيفات."
      title="التحليلات"
    >
      <AdminAnalyticsPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
