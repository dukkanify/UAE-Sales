import { ComingSoonPage } from "@/components/common/ComingSoonPage";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ComingSoonPage
          actionHref="/login"
          actionLabel="العودة لتسجيل الدخول"
          description="استعادة كلمة المرور ستستخدم OTP على رقم الهاتف أو البريد عند ربط خدمة المصادقة."
          eyebrow="استعادة الحساب"
          title="نسيت كلمة المرور؟"
        />
      </main>
      <SiteFooter />
    </>
  );
}
