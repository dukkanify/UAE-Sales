import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { NotificationsPageContent } from "@/features/notifications/NotificationsPageContent";
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
          activePath="/profile"
          description="جميع الإشعارات من مصدر واحد — متزامنة مع الجرس."
          title="الإشعارات"
          user={user}
        >
          <NotificationsPageContent />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
