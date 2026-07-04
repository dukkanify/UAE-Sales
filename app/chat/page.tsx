import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

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
