import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { BusinessOnboardingForm } from "@/features/auth/components/BusinessOnboardingForm";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { requireCurrentUser } from "@/services/profile";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default async function BusinessOnboardingPage() {
  const user = await requireCurrentUser("/dashboard/business-onboarding");

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <DashboardShell
          activePath="/dashboard/business-onboarding"
          description="أكمل بيانات نشاطك التجاري بعد التحقق من البريد الإلكتروني."
          title="إعداد الحساب التجاري"
          user={user}
        >
          <BusinessOnboardingForm />
        </DashboardShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
