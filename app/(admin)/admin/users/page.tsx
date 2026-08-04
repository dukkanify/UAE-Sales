"use client";

import { UserManagementTable } from "@/features/users/components/user-management-table";

export default function AdminUsersPage() {
  return (
    <UserManagementTable
      title="Users"
      description="Manage students and instructors. Creating admins is Super Admin only."
      roleFilter={null}
      emptyTitle="No users found"
      emptyAction={{ label: "Add student", href: "/admin/students" }}
    />
  );
}
