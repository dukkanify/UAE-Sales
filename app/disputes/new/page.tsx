import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function NewDisputePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          description="واجهة فتح النزاع ستدعم سبب النزاع، وصف المشكلة، ورفع الصور عند ربط الطلبات والضمان المالي."
          eyebrow="النزاعات"
          title="فتح نزاع جديد"
        />
      </main>
      <SiteFooter />
    </>
  );
}
