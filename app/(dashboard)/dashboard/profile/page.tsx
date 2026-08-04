import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your personal information."
        breadcrumbs={[
          { label: "Dashboard", href: routes.dashboard },
          { label: "Profile" },
        ]}
      />
      <EmptyState
        title="Profile coming soon"
        description="Profile editing will connect to the Supabase profiles table once business features begin."
      />
    </div>
  );
}
