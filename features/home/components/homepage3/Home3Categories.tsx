import Link from "next/link";
import type { Category } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Button } from "@/shared/ui/Button";
import { getHomepage3CategoryVisuals } from "@/services/content/homepage3.content";
import { Home3SectionHeader } from "./Home3SectionHeader";

type Home3CategoriesProps = {
  categories: Category[];
};

export async function Home3Categories({ categories }: Home3CategoriesProps) {
  const visuals = await getHomepage3CategoryVisuals();
  const visualMap = new Map(visuals.map((visual) => [visual.categoryId, visual]));
  const selected = categories
    .filter((category) => visualMap.has(category.id))
    .slice(0, 8);

  return (
    <section className="bg-[#fffbf4] py-24">
      <div className="app-container">
        <Home3SectionHeader
          action={
            <Button href="/categories" size="sm" variant="secondary">
              كل التصنيفات
            </Button>
          }
          description="مدخل بصري سريع لأهم أسواق UAE Sales، مصمم لتصفح جميل وواضح."
          eyebrow="Popular Categories"
          title="ابدأ من القسم الذي يشبهك"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {selected.map((category) => {
            const visual = visualMap.get(category.id);

            return (
              <Link
                key={category.id}
                className="group relative min-h-64 overflow-hidden rounded-[2rem] bg-surface shadow-[0_18px_55px_rgb(15_20_25/9%)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_75px_rgb(15_20_25/13%)]"
                href={`/categories/${category.slug}`}
              >
                <AppImage
                  alt={visual?.label ?? category.name}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  src={visual?.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-bold text-white/72">
                    {category.listingCount.toLocaleString("ar-AE")} إعلان
                  </p>
                  <h3 className="mt-1 text-xl font-black text-white">{category.name}</h3>
                </div>
                <span className="absolute end-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-black text-primary shadow-[var(--shadow-xs)]">
                  تصفح
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
