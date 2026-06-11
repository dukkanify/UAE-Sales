import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function WalletPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="واجهة المحفظة ستعرض الرصيد المتاح، الرصيد المعلق، وسجل العمليات عند ربط خدمات الدفع."
          eyebrow="المحفظة"
          title="محفظة المستخدم"
        />
      </main>
      <SiteFooter />
    </>
  );
}
