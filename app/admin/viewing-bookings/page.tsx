import { AdminViewingBookingsPanel } from "@/features/admin/components/AdminViewingBookingsPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminViewingBookingsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero eyebrow="الإدارة" title="حجوزات المعاينة" />
          <div className="mt-6">
            <AdminViewingBookingsPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
