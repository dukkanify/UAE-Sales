import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "System Settings" };

export default function SuperAdminSettingsPage() {
  return (
    <div>
      <PageHeader
        title="System settings"
        description="Security, email, Zoom, and payment configuration — Super Admin only."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Settings" },
        ]}
      />
      <EmptyState
        title="Settings infrastructure ready"
        description="The settings table and Super-Admin-only RLS policies are in place. Configuration screens will be added when integrations are wired."
      />
    </div>
  );
}
