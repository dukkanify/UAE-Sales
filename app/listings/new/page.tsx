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
            description="تدفق إضافة إعلان كامل يعمل بالبيانات الوهمية وlocalStorage حتى يكون جاهزاً للربط مع Backend لاحقاً."
          />
          <AddListingForm categories={categories} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
