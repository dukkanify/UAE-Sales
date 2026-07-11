import { AdminQuoteRequestsPanel } from "@/features/admin/components/AdminQuoteRequestsPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminQuoteRequestsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero eyebrow="الإدارة" title="طلبات عروض الأسعار" />
          <div className="mt-6">
            <AdminQuoteRequestsPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
