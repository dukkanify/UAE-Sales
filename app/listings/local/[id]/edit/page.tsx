import { LocalListingEdit } from "@/features/listings/components/LocalListingEdit";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

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
          description="عدّل بيانات إعلانك. إن كان مرفوضاً أو مسودة يُعاد إرساله للمراجعة قبل النشر."
          eyebrow="إعلاناتي"
          title="تعديل الإعلان"
        />
        <LocalListingEdit listingId={id} />
      </main>
      <SiteFooter />
    </>
  );
}
