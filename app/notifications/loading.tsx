import { DashboardShellSkeleton } from "@/shared/ui/Skeleton";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function NotificationsLoading() {
  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShellSkeleton />
      </main>
      <SiteFooter />
    </>
  );
}
