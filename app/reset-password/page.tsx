import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="أدخل كلمة مرور جديدة لحسابك. الرابط صالح لمرة واحدة ولمدة 60 دقيقة."
          footerAction={{
            href: "/login",
            label: "تسجيل الدخول",
            prompt: "تذكرت كلمة المرور؟",
          }}
          title="استعادة الحساب"
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
