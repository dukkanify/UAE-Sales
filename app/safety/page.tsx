import { LegalPage } from "@/shared/components/LegalPage";

export default function SafetyPage() {
  return (
    <LegalPage
      description="نصائح للتعامل الآمن داخل السوق."
      title="نصائح الأمان"
    >
      <ul className="list-disc space-y-2 pr-5">
        <li>التقِ في أماكن عامة عند المعاينة أو التسليم.</li>
        <li>استخدم الضمان المالي للمعاملات عالية القيمة.</li>
        <li>لا تحوّل المبالغ خارج المنصة قبل التحقق من الإعلان.</li>
        <li>تحقق من هوية البائع وتقييماته قبل الشراء.</li>
        <li>أبلغ عن الإعلانات المشبوهة عبر الدعم.</li>
      </ul>
    </LegalPage>
  );
}
