import Link from "next/link";
import type { Category, CategoryIconName } from "@/types";
import { AppImage } from "@/shared/components/AppImage";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import {
  getFinalCategoryImages,
  getFinalCategoryLabels,
} from "@/services/content/homepage-final.content";

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

const categoryIconMap: Record<CategoryIconName, IconName> = {
  baby: "baby",
  book: "book",
  briefcase: "briefcase",
  car: "car",
  food: "food",
  home: "home",
  laptop: "laptop",
  paw: "paw",
  phone: "phone",
  sofa: "sofa",
  sport: "sport",
  watch: "watch",
  wrench: "wrench",
};

type FinalCategoriesProps = {
  categories: Category[];
};

export async function FinalCategories({ categories }: FinalCategoriesProps) {
  const [images, labels] = await Promise.all([
    getFinalCategoryImages(),
    getFinalCategoryLabels(),
  ]);

  const selected = categories
    .filter((category) => featuredCategoryIds.includes(category.id))
    .sort(
      (a, b) =>
        featuredCategoryIds.indexOf(a.id) - featuredCategoryIds.indexOf(b.id),
    );

  return (
    <section className="bg-white pb-16 pt-28 md:pb-20 md:pt-32">
      <div className="app-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            التصنيفات الأكثر بحثاً
          </h2>
          <Link
            className="text-sm font-bold text-[#B8955F] transition hover:text-[#a6844f]"
            href="/categories"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selected.map((category) => {
            const imageUrl = images[category.id];
            const label = labels[category.id] ?? category.name;

            return (
              <Link
                key={category.id}
                className="group relative min-h-[8.5rem] overflow-hidden rounded-2xl bg-surface-muted shadow-[0_8px_32px_rgb(15_20_25/8%)] transition duration-300 hover:shadow-[0_12px_40px_rgb(15_20_25/12%)]"
                href={`/categories/${category.slug}`}
              >
                <AppImage
                  alt={label}
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  src={imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <span className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                    <Icon name={categoryIconMap[category.icon]} size={22} />
                  </span>
                  <h3 className="text-base font-bold text-white">{label}</h3>
                  <p className="text-xs font-medium text-white/70">
                    {category.listingCount.toLocaleString("ar-AE")} إعلان
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
