import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { VerifyEmailContent } from "@/features/auth/components/VerifyEmailContent";
import { readOtpDisplayCookie } from "@/services/auth/otp-display-cookie";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type VerifyEmailPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = getParam(params, "email") ?? "";
  const initialOtp = email ? await readOtpDisplayCookie(email) : null;

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main className="auth-page">
        <AuthShell
          description="أدخل رمز التحقق المرسل إلى بريدك. بعد التحقق من الشخص يُعتمد حسابك بسهولة."
          footerAction={{
            href: "/login",
            label: "تسجيل الدخول",
            prompt: "لديك حساب؟",
          }}
          title="تحقق من الشخص"
        >
          <Suspense fallback={<p className="text-sm text-muted">جاري التحميل...</p>}>
            <VerifyEmailContent initialOtp={initialOtp} />
          </Suspense>
        </AuthShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
