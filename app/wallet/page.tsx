import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function WalletPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="عرض الرصيد المتاح، الرصيد المعلق، وسجل العمليات."
          eyebrow="المحفظة"
          icon="wallet"
          title="محفظة المستخدم"
        />
      </main>
      <SiteFooter />
    </>
  );
}
