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
          description="واجهة تسجيل دخول عربية جاهزة لربط OTP وUAE PASS، وتناسب رحلة المشتري والبائع داخل السوق."
          footerAction={{
            href: "/register",
            label: "أنشئ حساباً جديداً",
            prompt: "ليس لديك حساب؟",
          }}
          title="مرحباً بعودتك إلى سوق الإمارات."
        >
          <LoginForm />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
