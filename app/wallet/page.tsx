import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

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
