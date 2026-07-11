import { AdminJobApplicationsPanel } from "@/features/admin/components/AdminJobApplicationsPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminJobApplicationsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero eyebrow="الإدارة" title="طلبات التوظيف" />
          <div className="mt-6">
            <AdminJobApplicationsPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
