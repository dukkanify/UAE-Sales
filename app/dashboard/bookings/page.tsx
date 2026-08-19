import { Suspense } from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { BookingsInbox } from "@/features/dashboard/components/BookingsInbox";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

export default async function BookingsPage() {
  const user = await requireCurrentUser("/dashboard/bookings");
  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/dashboard/bookings"
          description="حجوزات المعاينة كمشترٍ أو معلن، مع تأكيد الموعد أو إلغائه."
          title="حجوزات المعاينة"
          user={user}
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <BookingsInbox />
          </Suspense>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
