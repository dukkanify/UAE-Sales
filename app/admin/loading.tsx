import { AdminLoading } from "@/features/admin/components/AdminLoading";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function AdminLoadingPage() {
  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <AdminLoading />
      </main>
      <SiteFooter />
    </>
  );
}
