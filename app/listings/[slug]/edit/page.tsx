import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getListingBySlug } from "@/services/listingsService";

type EditListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  return (
    <>
      <SiteHeader />
      <main className="app-container py-12">
        <Card className="p-8">
          <h1 className="text-3xl font-black text-ink">تعديل الإعلان</h1>
          <p className="mt-3 leading-8 text-muted">
            {listing
              ? `واجهة تعديل الإعلان "${listing.title}" جاهزة للربط مع API التعديل.`
              : "الإعلان غير موجود في البيانات الحالية."}
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-black text-white"
            href="/dashboard/listings"
          >
            العودة إلى إعلاناتي
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
