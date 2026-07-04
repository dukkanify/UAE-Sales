import { LocalListingEdit } from "@/components/listings/LocalListingEdit";
import { PageHero } from "@/components/ui/PageHero";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";

type LocalListingEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LocalListingEditPage({
  params,
}: LocalListingEditPageProps) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="app-container page-padding">
        <PageHero
          description="عدّل بيانات إعلانك المحفوظ محلياً. التغييرات ستظهر فوراً في إعلاناتي ونتائج البحث."
          eyebrow="إعلاناتي"
          title="تعديل الإعلان"
        />
        <LocalListingEdit listingId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
