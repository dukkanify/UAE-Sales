import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterPendingContent } from "@/features/auth/components/RegisterPendingContent";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function RegisterPendingPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-page">
        <AuthShell
          description="تحققنا منك أولاً. الاعتماد خطوة واحدة سهلة من الإدارة، وسنُعلمك فور تفعيل الحساب."
          footerAction={{
            href: "/login",
            label: "تسجيل الدخول",
            prompt: "لديك حساب نشط؟",
          }}
          title="حسابك بانتظار الاعتماد"
        >
          <RegisterPendingContent />
        </AuthShell>
      </main>
      <SiteFooter />
    </>
  );
}
