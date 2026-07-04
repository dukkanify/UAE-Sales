import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

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
