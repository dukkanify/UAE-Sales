"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";
import type { Role } from "@/types";

export default function Page() {
  return (
    <UserManagementTable
      title="All users"
      description="Search, filter, and manage every platform account."
      roleFilter={null as Role | null}
      emptyTitle="No users found"
      emptyAction={{ label: "Invite user", href: "/super-admin/users" }}
    />
  );
}
