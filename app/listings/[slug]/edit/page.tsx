import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getListingBySlug } from "@/services/listings";

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
      <main className="app-container page-padding section-padding">
        <PageHero
          description={
            listing
              ? `واجهة تعديل الإعلان "${listing.title}" جاهزة للربط مع API التعديل.`
              : "الإعلان غير موجود في البيانات الحالية."
          }
          eyebrow="إعلاناتي"
          title="تعديل الإعلان"
        />
        <Card className="p-6">
          <Button href="/dashboard/listings" variant="secondary">
            العودة إلى إعلاناتي
          </Button>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
