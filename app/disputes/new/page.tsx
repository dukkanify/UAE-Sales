import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

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
