import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { getCurrentUser } from "@/services/profile";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="تابع رسائل المنصة وتحديثات الطلبات والضمان والمحفظة."
          title="الإشعارات"
          user={user}
        >
          <NotificationsPanel />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
