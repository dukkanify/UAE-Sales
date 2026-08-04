import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Account preferences and security."
        breadcrumbs={[
          { label: "Dashboard", href: routes.dashboard },
          { label: "Settings" },
        ]}
      />
      <EmptyState
        title="Settings coming soon"
        description="Notification preferences and security settings will be implemented in a later milestone."
      />
    </div>
  );
}
