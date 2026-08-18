import type { Listing } from "@/types";
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
  sections: HomeSection[];
};

/** Below-fold desktop rails. Stays a Server Component so async sections can await. */
export function DeferredHomeBelowFold({
  appPreviewListings,
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
      <MarketEmirates />
      <MarketAppDownload previewListings={appPreviewListings} />
    </>
  );
}
