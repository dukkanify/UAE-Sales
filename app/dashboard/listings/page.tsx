import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MyListingsDashboard } from "@/components/dashboard/MyListingsDashboard";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";
import { getMyListings } from "@/services/listingsService";
import { getCurrentUser } from "@/services/userService";

export default async function DashboardListingsPage() {
  const [categories, listings, user] = await Promise.all([
    getCategories(),
    getMyListings(),
    getCurrentUser(),
  ]);

  return (
    <>
      <SiteHeader />
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
      <SiteFooter />
    </>
  );
}
