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
    <section className="bg-[#fdfbf7] pb-16 pt-[6.5rem] md:pb-20 md:pt-28">
      <div className="app-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#B8955F]">استكشف السوق الإماراتي</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              التصنيفات الأكثر بحثاً
            </h2>
          </div>
          <Link
            className="text-sm font-bold text-[#B8955F] transition hover:text-[#9a7d4a]"
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
                className="group relative min-h-[9rem] overflow-hidden rounded-2xl border border-white/70 bg-[#e8e4de] shadow-[0_8px_28px_rgb(15_20_25/7%)] ring-1 ring-[#B8955F]/0 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgb(184_149_95/18%)] hover:ring-[#B8955F]/30"
                href={`/categories/${category.slug}`}
              >
                <AppImage
                  alt={label}
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  src={imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/22 to-black/10 transition duration-300 group-hover:from-black/52" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <span className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/18 text-white backdrop-blur-sm transition group-hover:border-[#B8955F]/40 group-hover:bg-[#B8955F]/25">
                    <Icon name={categoryIconMap[category.icon]} size={22} />
                  </span>
                  <h3 className="text-base font-bold text-white">{label}</h3>
                  <p className="text-xs font-semibold text-white/80">
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
