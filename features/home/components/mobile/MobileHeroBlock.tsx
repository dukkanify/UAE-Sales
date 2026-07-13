import type { Category } from "@/types";
import { MobileHeroSection } from "./MobileHeroSection";
import { MobileSearchCard } from "./MobileSearchCard";

type MobileHeroBlockProps = {
  categories: Category[];
};

export function MobileHeroBlock({ categories }: MobileHeroBlockProps) {
  return (
    <div className="mobile-home-hero-block">
      <MobileHeroSection />
      <MobileSearchCard categories={categories} />
    </div>
  );
}
