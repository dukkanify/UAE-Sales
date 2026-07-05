import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ProfileActivityPanel } from "@/features/profile/components/ProfileActivityPanel";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="عرض وتعديل بيانات المستخدم، مع مساحة واضحة لحالة التوثيق وربط UAE PASS لاحقاً."
          title="الملف الشخصي"
          user={user}
        >
          <ProfileForm user={user} />
          <ProfileActivityPanel />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
