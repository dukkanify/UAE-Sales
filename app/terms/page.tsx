import { LegalPage } from "@/shared/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      description="الشروط الأساسية لاستخدام منصة UAE Sales."
      title="الشروط والأحكام"
    >
      <p>
        باستخدامك لمنصة UAE Sales، فإنك توافق على الالتزام بسياسات المنصة
        وقوانين دولة الإمارات العربية المتحدة المعمول بها.
      </p>
      <ul className="mt-4 list-disc space-y-2 pr-5">
        <li>يجب أن تكون المعلومات المقدمة في الإعلانات صحيحة ودقيقة.</li>
        <li>يحظر نشر محتوى مخالف للقانون أو مضلل أو احتيالي.</li>
        <li>تحتفظ المنصة بحق تعليق أو إزالة الإعلانات المخالفة.</li>
        <li>المعاملات عبر الضمان المالي تخضع لسياسة الضمان والاسترداد.</li>
      </ul>
      <p className="mt-4 text-xs">
        هذه صفحة placeholder للإطلاق — يجب استبدالها بنص قانوني معتمد قبل
        الإنتاج الكامل.
      </p>
    </LegalPage>
  );
}
