import { Suspense } from "react";
import { DisputesDashboard } from "@/features/disputes/components/DisputesDashboard";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Card } from "@/shared/ui/Card";
import { requireCurrentUser } from "@/services/profile";

export default async function DashboardDisputesPage() {
  const user = await requireCurrentUser("/dashboard/disputes");

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/dashboard/disputes"
          description="افتح نزاع الضمان بسهولة، حدّد السبب خلال المهلة، وتابع الردود والتنبيهات من مكان واحد."
          title="النزاعات"
          user={user}
        >
          <Suspense
            fallback={
              <Card className="p-8 text-center" variant="flat">
                <p className="text-sm text-muted">جاري التحميل...</p>
              </Card>
            }
          >
            <DisputesDashboard />
          </Suspense>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
