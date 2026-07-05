import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

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
