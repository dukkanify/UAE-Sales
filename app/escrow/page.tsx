import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function EscrowPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="شرح واجهة الضمان المالي جاهز: يتم حجز المبلغ حتى يؤكد المشتري استلام المنتج مطابقاً للمواصفات."
          eyebrow="الضمان المالي"
          title="حماية الدفع في UAE Sales"
        />
      </main>
      <SiteFooter />
    </>
  );
}
