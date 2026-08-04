import { AnalyticsHubView } from "@/features/analytics";
import { ReportsDashboardView } from "@/features/certificates";

export default function InstructorReportsPage() {
  return (
    <div className="space-y-10">
      <AnalyticsHubView
        roleLabel="Instructor"
        defaultScope="instructor"
        allowedScopes={["instructor", "learning", "live"]}
      />
      <div className="border-t pt-8">
        <ReportsDashboardView roleLabel="Instructor" scope="instructor" />
      </div>
    </div>
  );
}
