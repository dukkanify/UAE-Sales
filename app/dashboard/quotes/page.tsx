import { Suspense } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { QuotesInbox } from "@/features/dashboard/components/QuotesInbox";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

export default async function QuotesPage() {
  const user = await requireCurrentUser("/dashboard/quotes");
  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/dashboard/quotes"
          description="طلبات عروض الأسعار وحجوزات الخدمات."
          title="طلبات الخدمات"
          user={user}
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <QuotesInbox />
          </Suspense>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
