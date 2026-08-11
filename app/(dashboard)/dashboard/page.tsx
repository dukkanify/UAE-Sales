import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Eager Pilots learning dashboard.",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Overview"
        description="Your aviation education workspace. Business features will land here in upcoming milestones."
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: "Dashboard" },
        ]}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Programs", value: "—" },
          { title: "Progress", value: "—" },
          { title: "Sessions", value: "—" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold text-primary">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <EmptyState
        title="Foundation ready"
        description="Course enrollment, schedules, and consultation workflows will be added in future tasks. The layout, auth, and UI system are in place."
      />
    </div>
  );
}
