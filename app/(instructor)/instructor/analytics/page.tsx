import { AnalyticsHubView } from "@/features/analytics";

export default function InstructorAnalyticsPage() {
  return (
    <AnalyticsHubView
      roleLabel="Instructor"
      defaultScope="instructor"
      allowedScopes={["instructor", "learning", "live"]}
    />
  );
}
