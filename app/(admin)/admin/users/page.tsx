import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Manage Users" };

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage students and instructors. Creating admins is Super Admin only."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
      />
      <EmptyState
        title="User management foundation"
        description="CRUD interfaces for students and instructors will use the RBAC permission layer already in place."
      />
    </div>
  );
}
