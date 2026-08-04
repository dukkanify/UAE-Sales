"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Users } from "lucide-react";

import type { Role, UserProfile } from "@/types";
import { ACCOUNT_STATUS_LABELS } from "@/constants/account-status";
import { ROLE_LABELS } from "@/constants/roles";
import { authFetch } from "@/features/auth/services/auth-api";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  pending: "warning",
  suspended: "destructive",
  inactive: "secondary",
};

interface UserManagementTableProps {
  title: string;
  description: string;
  roleFilter?: Role | null;
  emptyTitle?: string;
  emptyAction?: { label: string; href: string };
  profileBasePath?: string;
}

function UserManagementTable({
  title,
  description,
  roleFilter = null,
  emptyTitle = "No users found",
  emptyAction,
  profileBasePath,
}: UserManagementTableProps) {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const params = roleFilter ? `?role=${roleFilter}` : "";
      const result = await authFetch<UserProfile[]>(`/api/users${params}`);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error ?? "Failed to load users");
        setUsers([]);
      } else {
        setUsers(result.data ?? []);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [roleFilter]);

  const filtered =
    statusFilter === "all" ? users : users.filter((u) => u.status === statusFilter);

  const columns: DataTableColumn<UserProfile>[] = [
    {
      id: "fullName",
      header: "Name",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.fullName || "—"}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      cell: (row) => <Badge variant="outline">{ROLE_LABELS[row.role]}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? "secondary"}>
          {ACCOUNT_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      id: "countryCode",
      header: "Country",
      cell: (row) => row.countryCode || "—",
    },
    {
      id: "lastLoginAt",
      header: "Last login",
      cell: (row) =>
        row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : "Never",
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${profileBasePath ?? "#"}?preview=${row.id}`}>Preview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Edit (soon)</DropdownMenuItem>
            <DropdownMenuItem disabled>Change status (soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: title }]}
        actions={
          emptyAction ? (
            <Button asChild>
              <Link href={emptyAction.href}>{emptyAction.label}</Link>
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Unable to load users"
          description={error}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      ) : !loading && filtered.length === 0 && statusFilter === "all" ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={emptyTitle}
          description="Accounts matching this filter will appear here once created."
          actionLabel={emptyAction?.label}
          onAction={
            emptyAction
              ? () => {
                  window.location.href = emptyAction.href;
                }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder="Search by name or email..."
          searchKeys={["fullName", "email", "firstName", "lastName"]}
          emptyMessage="No users match your filters"
          onExport={(rows) => {
            const csv = [
              ["Name", "Email", "Role", "Status", "Country"].join(","),
              ...rows.map((r) =>
                [r.fullName, r.email, r.role, r.status, r.countryCode]
                  .map((v) => `"${v ?? ""}"`)
                  .join(","),
              ),
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "users.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
          filters={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          }
          bulkActions={
            <Button size="sm" variant="outline" disabled>
              Bulk actions (soon)
            </Button>
          }
        />
      )}
    </div>
  );
}

export { UserManagementTable };
