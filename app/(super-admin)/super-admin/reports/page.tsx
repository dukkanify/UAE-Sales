import { AnalyticsHubView } from "@/features/analytics";
import { ReportsDashboardView } from "@/features/certificates";

export default function SuperAdminReportsPage() {
  return (
    <div className="space-y-10">
      <AnalyticsHubView roleLabel="Super Admin" defaultScope="executive" />
      <div className="border-t pt-8">
        <ReportsDashboardView roleLabel="Super Admin" scope="executive" />
      </div>
    </div>
  );
}
