import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { MyListingsDashboard } from "@/features/dashboard/components/MyListingsDashboard";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";
import { getMyListings } from "@/services/listings";
import { requireCurrentUser } from "@/services/profile";

export default async function DashboardListingsPage() {
  const user = await requireCurrentUser("/dashboard/listings");
  const [categories, listings] = await Promise.all([
    getCategories(),
    getMyListings(user.id),
  ]);

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <DashboardShell
          activePath="/dashboard/listings"
          description="متابعة الإعلانات النشطة، المنتهية، المسودات، قيد المراجعة، والمرفوضة من مكان واحد."
          title="إعلاناتي"
          user={user}
        >
          <MyListingsDashboard categories={categories} listings={listings} />
        </DashboardShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
