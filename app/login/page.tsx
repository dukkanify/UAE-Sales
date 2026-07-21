import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="منصة إماراتية موثوقة لبيع وشراء المنتجات والخدمات مع نظام ضمان مالي يحمي حقوق المشتري والبائع."
          footerAction={{
            href: "/register",
            label: "أنشئ حساباً جديداً",
            prompt: "ليس لديك حساب؟",
          }}
          title="مرحباً بك في سوقنا"
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <LoginForm />
          </Suspense>
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
