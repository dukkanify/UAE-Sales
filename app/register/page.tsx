import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="أولاً نتحقق من الشخص برمز يصل إلى بريدك، ثم يُعتمد حسابك بسهولة لتبدأ البيع والشراء بثقة."
          footerAction={{
            href: "/login",
            label: "سجّل الدخول",
            prompt: "لديك حساب بالفعل؟",
          }}
          title="أنشئ حسابك في سوقنا"
        >
          <RegisterForm />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
