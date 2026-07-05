import { LegalPage } from "@/shared/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      description="كيف نتعامل مع بياناتك الشخصية في UAE Sales."
      title="سياسة الخصوصية"
    >
      <p>
        نجمع البيانات الضرورية لتشغيل الحساب والمعاملات والدعم، مثل الاسم
        والبريد والهاتف وسجل النشاط داخل المنصة.
      </p>
      <ul className="mt-4 list-disc space-y-2 pr-5">
        <li>لا نبيع بياناتك الشخصية لأطراف ثالثة.</li>
        <li>نستخدم التشفير وإعدادات جلسات آمنة لحماية الحساب.</li>
        <li>يمكنك طلب تحديث بياناتك من صفحة الملف الشخصي.</li>
        <li>نحتفظ بالسجلات وفق متطلبات الامتثال والأمان.</li>
      </ul>
      <p className="mt-4 text-xs">
        Placeholder — يتطلب مراجعة قانونية قبل الإطلاق الرسمي.
      </p>
    </LegalPage>
  );
}
