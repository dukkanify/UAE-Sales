import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { NotificationsCenter } from "@/features/notifications/NotificationsCenter";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";

export default async function NotificationsPage() {
  const user = await requireCurrentUser("/notifications");

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/notifications"
          description="كل التنبيهات في مكان واحد، مع تعليم المقروء والتفضيلات."
          title="الإشعارات"
          user={user}
        >
          <NotificationsCenter />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
