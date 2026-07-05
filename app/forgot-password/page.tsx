import { AuthShell } from "@/features/auth/components/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function ForgotPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AuthShell
          description="استعد الوصول إلى حسابك بخطوات بسيطة وآمنة عبر البريد الإلكتروني."
          footerAction={{
            href: "/register",
            label: "إنشاء حساب",
            prompt: "ليس لديك حساب؟",
          }}
          title="استعادة الحساب"
        >
          <ForgotPasswordForm />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
