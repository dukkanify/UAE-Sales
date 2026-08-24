import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import { readAuthDb } from "@/services/auth/store";

export const metadata: Metadata = { title: "Super Admin Dashboard" };

export default function SuperAdminDashboardPage() {
  ensureSuperAdminSeeded();
  const db = readAuthDb();

  return (
    <div>
      <PageHeader
        title="Super Admin dashboard"
        description="Full platform control — users, security, finance settings, and audit visibility."
        breadcrumbs={[{ label: "Super Admin" }, { label: "Dashboard" }]}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: String(db.users.length) },
          { label: "Sessions", value: String(db.sessions.filter((s) => !s.revokedAt).length) },
          { label: "Activity logs", value: String(db.activityLogs.length) },
          { label: "Notifications", value: String(db.notifications.length) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-primary">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <EmptyState
        title="System control plane"
        description="Payment, Zoom, email, and security settings UIs will attach to this Super Admin shell. Financial configuration is intentionally unavailable to Admins."
      />
    </div>
  );
}
