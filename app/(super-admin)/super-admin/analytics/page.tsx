import { AnalyticsHubView } from "@/features/analytics";

export default function SuperAdminAnalyticsPage() {
  return (
    <AnalyticsHubView
      roleLabel="Super Admin"
      defaultScope="executive"
    />
  );
}
