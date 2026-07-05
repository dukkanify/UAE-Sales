import { LegalPage } from "@/shared/components/LegalPage";

export default function EscrowPolicyPage() {
  return (
    <LegalPage
      description="قواعد الضمان المالي بين المشتري والبائع."
      title="سياسة الضمان المالي"
    >
      <p>
        عند الشراء عبر الضمان، يُحجز المبلغ لدى المنصة حتى يؤكد المشتري
        الاستلام أو يتم حل النزاع وفق الإجراءات المعتمدة.
      </p>
      <ul className="mt-4 list-disc space-y-2 pr-5">
        <li>يُطلق المبلغ للبائع بعد تأكيد الاستلام من المشتري.</li>
        <li>يمكن فتح نزاع خلال المدة المحددة في صفحة الطلب.</li>
        <li>قرارات النزاعات للإدارة تكون نهائية ضمن سياسة المنصة.</li>
      </ul>
    </LegalPage>
  );
}
