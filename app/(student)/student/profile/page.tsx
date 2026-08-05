import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Student Profile" };

export default function StudentProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your student profile details."
        breadcrumbs={[
          { label: "Student", href: "/student/dashboard" },
          { label: "Profile" },
        ]}
      />
      <EmptyState
        title="Profile settings"
        description="Detailed profile editing UI will expand here. Core profile fields are stored and secured."
      />
    </div>
  );
}
