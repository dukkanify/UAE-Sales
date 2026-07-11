import { AdminReportsPanel } from "@/features/admin/components/AdminReportsPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminReportsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="حجم المدفوعات، رسوم المنصة، وسجل أحداث Stripe."
            eyebrow="الإدارة"
            title="تقارير الدفع"
          />
          <div className="mt-6">
            <AdminReportsPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
