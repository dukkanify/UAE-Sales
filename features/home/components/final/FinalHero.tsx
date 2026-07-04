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
    <section className="bg-background pb-12 pt-7 md:pb-14 md:pt-9">
      <div className="app-container">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="order-2 lg:order-1">
            <FinalHeroCollage />
          </div>

          <div className="order-1 lg:order-2">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              بيع وشراء بثقة في الإمارات
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              منصة إماراتية ذكية تجمع السيارات، العقارات، الإلكترونيات والخدمات
              في مكان واحد مع ضمان مالي يحمي المشتري والبائع.
            </p>

            <div className="mt-5">
              <FinalHeroSearch categories={categories} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button href="/listings/new" size="md" variant="primary">
                أضف إعلانك الآن
              </Button>
              <Button href="/search" size="md" variant="secondary">
                تصفح الإعلانات
              </Button>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {trustPoints.map((point) => (
                <li
                  key={point.label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-secondary-soft text-secondary">
                    <Icon name={point.icon} size={14} />
                  </span>
                  {point.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
