import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AuthShell
          description="منصة إماراتية موثوقة لبيع وشراء المنتجات والخدمات مع نظام ضمان مالي يحمي حقوق المشتري والبائع."
          footerAction={{
            href: "/register",
            label: "أنشئ حساباً جديداً",
            prompt: "ليس لديك حساب؟",
          }}
          title="مرحباً بك في UAE Sales"
        >
          <LoginForm />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
