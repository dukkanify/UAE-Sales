import { DashboardShellSkeleton } from "@/shared/ui/Skeleton";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function WalletLoading() {
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
