import { AdminEscrowPanel } from "@/features/admin/components/AdminEscrowPanel";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { PageHero } from "@/shared/ui/PageHero";

export default function AdminEscrowPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="متابعة المبالغ المحجوزة وحالة الضمان."
            eyebrow="الإدارة"
            title="الضمان المالي"
          />
          <div className="mt-6">
            <AdminEscrowPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
