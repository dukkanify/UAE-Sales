import { AnalyticsHubView } from "@/features/analytics";

export default function AdminAnalyticsPage() {
  return (
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
  );
}
