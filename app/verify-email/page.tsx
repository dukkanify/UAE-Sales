import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { VerifyEmailContent } from "@/features/auth/components/VerifyEmailContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function VerifyEmailPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AuthShell
          description="أدخل رمز التحقق المرسل إلى بريدك الإلكتروني لإكمال العملية."
          footerAction={{
            href: "/login",
            label: "تسجيل الدخول",
            prompt: "لديك حساب؟",
          }}
          title="التحقق من البريد الإلكتروني"
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
