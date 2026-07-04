import { AddListingForm } from "@/components/listings/AddListingForm";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteFooter } from "@/layouts/SiteFooter";
import { SiteHeader } from "@/layouts/SiteHeader";
import { getCategories } from "@/services/categoriesService";

export default async function NewListingPage() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container py-10 lg:py-14">
          <SectionHeader
            eyebrow="إضافة إعلان"
            title="انشر إعلانك في سوق الإمارات"
            description="أضف إعلانك في خطوات بسيطة: اختر القسم، اكتب التفاصيل، أرفق الصور، ثم انشر مباشرة."
          />
          <AddListingForm categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
