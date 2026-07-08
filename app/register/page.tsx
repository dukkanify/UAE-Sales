import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AuthShell
          description="انضم إلى منصة إماراتية موثوقة تتيح لك بيع وشراء المنتجات والخدمات مع ضمان مالي وتجربة آمنة داخل الإمارات."
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
