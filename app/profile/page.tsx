import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { FavoritesPanel } from "@/features/profile/components/FavoritesPanel";
import { ProfileActivityPanel } from "@/features/profile/components/ProfileActivityPanel";
import { ProfileHashScroll } from "@/features/profile/components/ProfileHashScroll";
import { SecuritySettingsPanel } from "@/features/profile/components/SecuritySettingsPanel";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { Card } from "@/shared/ui/Card";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <ProfileHashScroll />
        <DashboardShell
          activePath="/profile"
          description="عرض وتعديل بيانات المستخدم، مع مساحة واضحة لحالة التوثيق والمفضلة."
          title="الملف الشخصي"
          user={user}
        >
          <ProfileForm user={user} />
          <div className="mt-6">
            <SecuritySettingsPanel />
          </div>
          <Card className="mt-6 scroll-mt-24 p-5" id="favorites" variant="flat">
            <h2 className="text-sm font-semibold text-ink">المفضلة</h2>
            <div className="mt-4">
              <FavoritesPanel />
            </div>
          </Card>
          <ProfileActivityPanel />
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
