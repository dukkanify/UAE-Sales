import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        description="Daily operations — students, instructors, courses, and content moderation."
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {["Students", "Instructors", "Courses"].map((label) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-primary">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <EmptyState
        title="Operations console ready"
        description="Financial and system settings are reserved for Super Admin. Admin management modules will land here next."
      />
    </div>
  );
}
