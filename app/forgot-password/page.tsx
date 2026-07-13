import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="استعد الوصول إلى حسابك بخطوات بسيطة وآمنة عبر البريد الإلكتروني."
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
      <SiteFooter />
    </>
  );
}
