import { ComingSoonPage } from "@/shared/components/ComingSoonPage";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          actionHref="/dashboard/listings"
          actionLabel="العودة للوحة التحكم"
          description="مراجعة الإعلانات، الموافقة والرفض، إدارة الطلبات والضمان والنزاعات — الواجهة الإدارية قيد التفعيل في الإصدار التالي."
          eyebrow="الإدارة"
          icon="shield"
          title="لوحة الإدارة"
        />
      </main>
      <SiteFooter />
    </>
  );
}
