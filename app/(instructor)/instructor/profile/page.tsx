import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Instructor Profile" };

export default function InstructorProfilePage() {
  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your instructor profile."
        breadcrumbs={[
          { label: "Instructor", href: "/instructor/dashboard" },
          { label: "Profile" },
        ]}
      />
      <EmptyState title="Profile settings" description="Instructor profile management foundation is ready." />
    </div>
  );
}
