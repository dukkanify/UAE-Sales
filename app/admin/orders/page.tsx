import { AdminOrdersPanel } from "@/features/admin/components/AdminOrdersPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="جميع الطلبات مع معرفات Stripe وحالة الاسترداد."
            eyebrow="الإدارة"
            title="الطلبات والمدفوعات"
          />
          <div className="mt-6">
            <AdminOrdersPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
