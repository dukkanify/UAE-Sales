import { AdminJobApplicationsPanel } from "@/features/admin/components/AdminJobApplicationsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminJobApplicationsPage() {
  return (
    <AdminShell
      activePath="/admin/job-applications"
      description="طلبات التوظيف الواردة من إعلانات الوظائف."
      title="طلبات التوظيف"
    >
      <AdminJobApplicationsPanel />
    </AdminShell>
  );
}
