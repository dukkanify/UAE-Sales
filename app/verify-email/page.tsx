import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { VerifyEmailContent } from "@/features/auth/components/VerifyEmailContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function VerifyEmailPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="أدخل رمز التحقق المرسل إلى بريدك. بعد التحقق من الشخص يُعتمد حسابك بسهولة."
          footerAction={{
            href: "/login",
            label: "تسجيل الدخول",
            prompt: "لديك حساب؟",
          }}
          title="تحقق من الشخص"
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <VerifyEmailContent />
          </Suspense>
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
