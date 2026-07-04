import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="تواصل مع البائع قبل إتمام الطلب."
          eyebrow="المحادثات"
          icon="message"
          title="المحادثات"
        />
      </main>
      <SiteFooter />
    </>
  );
}
