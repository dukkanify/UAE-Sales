import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

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
