import { AdminQuoteRequestsPanel } from "@/features/admin/components/AdminQuoteRequestsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminQuoteRequestsPage() {
  return (
    <AdminShell
      activePath="/admin/quote-requests"
      description="طلبات عروض الأسعار من أقسام الخدمات."
      title="طلبات عروض الأسعار"
    >
      <AdminQuoteRequestsPanel />
    </AdminShell>
  );
}
