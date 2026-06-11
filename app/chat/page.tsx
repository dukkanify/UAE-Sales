import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="واجهة المحادثة جاهزة للربط لاحقاً لتمكين التواصل بين البائع والمشتري قبل إتمام الطلب."
          eyebrow="المحادثات"
          title="محادثة البائع"
        />
      </main>
      <SiteFooter />
    </>
  );
}
