import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Button } from "@/shared/ui/Button";
import { getHomepage3CategoryVisuals } from "@/services/content/homepage3.content";
import { FinalSectionHeader } from "./FinalSectionHeader";

const featuredCategoryIds = [
  "cars",
  "real-estate",
  "mobiles",
  "electronics",
  "jobs",
  "services",
  "furniture",
  "fashion",
];

type FinalCategoriesProps = {
  categories: Category[];
};

export async function FinalCategories({ categories }: FinalCategoriesProps) {
  const visuals = await getHomepage3CategoryVisuals();
  const visualMap = new Map(visuals.map((visual) => [visual.categoryId, visual]));
  const selected = categories
    .filter((category) => featuredCategoryIds.includes(category.id))
    .sort(
      (a, b) =>
        featuredCategoryIds.indexOf(a.id) - featuredCategoryIds.indexOf(b.id),
    );

  return (
    <section className="bg-surface-muted/50 py-16 md:py-20">
      <div className="app-container">
        <FinalSectionHeader
          action={
            <Button href="/categories" size="sm" variant="secondary">
              كل التصنيفات
            </Button>
          }
          description="تصفح أهم أقسام السوق الإماراتي — من السيارات والعقارات إلى الوظائف والخدمات."
          title="تصفح حسب التصنيف"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selected.map((category) => {
            const visual = visualMap.get(category.id);

            return (
              <Link
                key={category.id}
                className="group relative min-h-56 overflow-hidden rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-soft)] transition duration-300 hover:shadow-[var(--shadow-card)]"
                href={`/categories/${category.slug}`}
              >
                <AppImage
                  alt={category.name}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  src={visual?.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/5 transition duration-300 group-hover:from-black/72" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xs font-medium text-white/70">
                    {category.listingCount.toLocaleString("ar-AE")} إعلان
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">{category.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
