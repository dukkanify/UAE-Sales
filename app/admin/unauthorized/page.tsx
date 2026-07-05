import { AdminUnauthorized } from "@/features/admin/components/AdminUnauthorized";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

export default function AdminUnauthorizedPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <AdminUnauthorized />
      </main>
      <SiteFooter />
    </>
  );
}
