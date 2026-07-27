"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/types";
import { MarketCategorySection } from "@/features/home/components/marketplace/MarketCategorySection";

const MarketEmirates = dynamic(
  () =>
    import("@/features/home/components/marketplace/MarketEmirates").then(
      (mod) => mod.MarketEmirates,
    ),
  { ssr: true },
);

const MarketAppDownload = dynamic(
  () =>
    import("@/features/home/components/marketplace/MarketAppDownload").then(
      (mod) => mod.MarketAppDownload,
    ),
  { ssr: true },
);

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

/** Below-fold desktop rails + heavy widgets, code-split for faster first paint. */
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
