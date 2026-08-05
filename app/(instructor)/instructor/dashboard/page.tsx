import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Instructor Dashboard" };

export default function InstructorDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Instructor dashboard"
        description="Teaching workspace for courses, students, sessions, and earnings."
        breadcrumbs={[{ label: "Instructor" }, { label: "Dashboard" }]}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {["My Courses", "My Students", "Earnings"].map((label) => (
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
        title="Instructor tools coming next"
        description="Schedule, Zoom sessions, attendance, quizzes, and wallet modules will attach to this shell."
      />
    </div>
  );
}
