import { LegalPage } from "@/shared/components/LegalPage";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      description="سياسة الاسترداد للمعاملات المحمية بالضمان."
      title="سياسة الاسترداد"
    >
      <p>
        يحق للمشتري طلب استرداد كامل أو جزئي عند عدم التسليم أو عدم مطابقة
        المنتج للوصف، وفق تقييم النزاع.
      </p>
      <ul className="mt-4 list-disc space-y-2 pr-5">
        <li>الاسترداد الكامل عند عدم التسليم.</li>
        <li>الاسترداد الجزئي عند وجود اختلاف جوهري في المنتج.</li>
        <li>تتم معالجة الاسترداد إلى المحفظة أو وسيلة الدفع الأصلية حسب الحالة.</li>
      </ul>
    </LegalPage>
  );
}
