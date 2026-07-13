import { AddListingForm } from "@/features/listings/components/AddListingForm.lazy";
import { PageHero } from "@/shared/ui/PageHero";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCategories } from "@/services/categories";

export default async function NewListingPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container px-3 pb-8 pt-4 md:page-padding">
          <PageHero
            compact
            description="أضف إعلانك في خطوات بسيطة: اختر القسم، اكتب التفاصيل، أرفق الصور، ثم انشر مباشرة."
            eyebrow="إضافة إعلان"
            title="انشر إعلانك في سوقنا"
          />
          <AddListingForm categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
