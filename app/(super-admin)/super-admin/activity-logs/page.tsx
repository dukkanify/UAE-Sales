import type { Metadata } from "next";

import { ActivityLogsView } from "@/features/settings/components/activity-logs-view";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";

export const metadata: Metadata = { title: "System logs" };

export default function ActivityLogsPage() {
  ensureSuperAdminSeeded();
  return <ActivityLogsView />;
}
