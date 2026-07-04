import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function EscrowPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="حجز المبلغ حتى يؤكد المشتري استلام المنتج."
          eyebrow="الضمان المالي"
          icon="shield"
          title="حماية الدفع"
        />
      </main>
      <SiteFooter />
    </>
  );
}
