import { AddListingForm } from "@/components/listings/AddListingForm";
import { PageHero } from "@/components/ui/PageHero";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";

export default async function NewListingPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="أضف إعلانك في خطوات بسيطة: اختر القسم، اكتب التفاصيل، أرفق الصور، ثم انشر مباشرة."
            eyebrow="إضافة إعلان"
            title="انشر إعلانك في سوق الإمارات"
          />
          <AddListingForm categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
