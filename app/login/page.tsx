import { Suspense } from "react";
import { AdminLoginStage } from "@/features/auth/components/AdminLoginStage";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getParam(params, "next") ?? "";
  const isAdminGate = nextPath.startsWith("/admin");

  if (isAdminGate) {
    return <AdminLoginStage />;
  }

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
