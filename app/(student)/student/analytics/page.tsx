import { AnalyticsHubView } from "@/features/analytics";

export default function StudentAnalyticsPage() {
  return (
    <AnalyticsHubView
      roleLabel="Student"
      defaultScope="student"
      allowedScopes={["student"]}
    />
  );
}
