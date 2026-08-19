import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { AdminJobApplicationsPanel } from "@/features/admin/components/AdminJobApplicationsPanel";
import { AdminShell } from "@/features/admin/components/AdminShell";

export default function AdminJobApplicationsPage() {
  return (
    <LocalizedTree>
    <AdminShell
      activePath="/admin/job-applications"
      description="طلبات التوظيف الواردة من إعلانات الوظائف."
      title="طلبات التوظيف"
    >
      <AdminJobApplicationsPanel />
    </AdminShell>
    </LocalizedTree>
  );
}
