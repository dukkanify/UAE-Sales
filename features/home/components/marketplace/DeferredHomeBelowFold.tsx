import type { Listing } from "@/types";
import type { UaeEmirateCard } from "@/features/home/shared/uae-emirates";
import { MarketCategorySection } from "@/features/home/components/marketplace/MarketCategorySection";
import { MarketEmirates } from "@/features/home/components/marketplace/MarketEmirates";
import { MarketAppDownload } from "@/features/home/components/marketplace/MarketAppDownload";

type HomeSection = {
  categoryId: string;
  categorySlug: string;
  description: string;
  eyebrow: string;
  listings: Listing[];
  title: string;
  variant: "sand" | "white";
};

type DeferredHomeBelowFoldProps = {
  appPreviewListings: Listing[];
  emirates: UaeEmirateCard[];
  sections: HomeSection[];
};

/** Below-fold desktop rails. Receives awaited emirate cards so this tree never suspends. */
export function DeferredHomeBelowFold({
  appPreviewListings,
  emirates,
  sections,
}: DeferredHomeBelowFoldProps) {
  return (
    <>
      {sections.map((section) => (
        <MarketCategorySection
          key={section.categoryId}
          categoryId={section.categoryId}
          categorySlug={section.categorySlug}
          description={section.description}
          eyebrow={section.eyebrow}
          listings={section.listings}
          title={section.title}
          variant={section.variant}
        />
      ))}
      <MarketEmirates emirates={emirates} />
      <MarketAppDownload previewListings={appPreviewListings} />
    </>
  );
}
