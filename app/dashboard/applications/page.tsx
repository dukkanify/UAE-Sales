import { Suspense } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ApplicationsInbox } from "@/features/dashboard/components/ApplicationsInbox";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

export default async function ApplicationsPage() {
  const user = await requireCurrentUser("/dashboard/applications");
  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/dashboard/applications"
          description="طلبات التوظيف المقدّمة والمستلمة."
          title="طلبات التوظيف"
          user={user}
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <ApplicationsInbox />
          </Suspense>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
