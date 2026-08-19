import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main className="auth-page">
        <AuthShell
          description="أرسل رابطاً آمناً إلى بريدك لإعادة تعيين كلمة المرور دون استخدام رمز تحقق."
          footerAction={{
            href: "/register",
            label: "إنشاء حساب",
            prompt: "ليس لديك حساب؟",
          }}
          title="استعادة الحساب"
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <ForgotPasswordForm />
          </Suspense>
        </AuthShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
