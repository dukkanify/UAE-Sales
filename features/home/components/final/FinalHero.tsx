import type { Category } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { FinalHeroCollage } from "./FinalHeroCollage";
import { FinalHeroSearch } from "./FinalHeroSearch";

type FinalHeroProps = {
  categories: Category[];
};

const trustPoints = [
  { icon: "shield" as const, label: "ضمان مالي" },
  { icon: "check" as const, label: "بائعون موثقون" },
  { icon: "wallet" as const, label: "دفع آمن" },
];

export function FinalHero({ categories }: FinalHeroProps) {
  return (
    <section className="bg-background pb-16 pt-10 md:pb-20 md:pt-14">
      <div className="app-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <FinalHeroCollage />
          </div>

          <div className="order-1 lg:order-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              بيع وشراء بثقة في الإمارات
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-muted md:text-lg">
              منصة إماراتية ذكية تجمع السيارات، العقارات، الإلكترونيات والخدمات
              في مكان واحد مع ضمان مالي يحمي المشتري والبائع.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/listings/new" size="lg" variant="primary">
                أضف إعلانك الآن
              </Button>
              <Button href="/search" size="lg" variant="secondary">
                تصفح الإعلانات
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {trustPoints.map((point) => (
                <li
                  key={point.label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-secondary-soft text-secondary">
                    <Icon name={point.icon} size={15} />
                  </span>
                  {point.label}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <FinalHeroSearch categories={categories} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
