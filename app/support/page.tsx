import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="مركز الدعم سيضم الأسئلة الشائعة وقنوات التواصل ومتابعة الطلبات والنزاعات."
          eyebrow="الدعم"
          title="كيف نقدر نساعدك؟"
        />
      </main>
      <SiteFooter />
    </>
  );
}
