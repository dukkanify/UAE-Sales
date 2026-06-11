import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCurrentUser } from "@/services/userService";

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
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
