import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Student Dashboard" };

export default function StudentDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Student dashboard"
        description="Your learning workspace. Course features arrive in a later milestone."
        breadcrumbs={[{ label: "Student" }, { label: "Dashboard" }]}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {["My Courses", "Assignments", "Certificates"].map((label) => (
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
        title="Ready for learning modules"
        description="Enrollments, calendar, Zoom classes, quizzes, and community will connect here."
      />
    </div>
  );
}
