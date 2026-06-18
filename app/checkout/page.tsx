import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          actionHref="/escrow"
          actionLabel="كيف يعمل الضمان؟"
          description="واجهة الدفع جاهزة لتعرض سعر المنتج، رسوم الدفع الإلكتروني، والإجمالي مع توضيح حجز المبلغ في الضمان المالي."
          eyebrow="الدفع"
          title="إتمام الشراء بأمان"
        />
      </main>
      <SiteFooter />
    </>
  );
}
