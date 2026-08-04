import { AnalyticsHubView } from "@/features/analytics";
import { ReportsDashboardView } from "@/features/certificates";

export default function AdminReportsPage() {
  return (
    <div className="space-y-10">
      <AnalyticsHubView
        roleLabel="Admin"
        defaultScope="learning"
        allowedScopes={[
          "learning",
          "course",
          "instructor",
          "live",
          "community",
          "support",
          "financial",
        ]}
      />
      <div className="border-t pt-8">
        <ReportsDashboardView roleLabel="Admin" scope="admin" />
      </div>
    </div>
  );
}
