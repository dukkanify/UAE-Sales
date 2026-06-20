import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

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
          title="أنشئ حسابك في UAE Sales"
        >
          <RegisterForm />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
