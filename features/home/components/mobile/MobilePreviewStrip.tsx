import type { Listing } from "@/types";
import { DragScrollRow } from "@/shared/components/DragScrollRow";
import { MobileFeaturedCard } from "./MobileFeaturedCard";
import { MobileSectionHeader } from "./MobileSectionHeader";

type MobilePreviewStripProps = {
  listings: Listing[];
};

export function MobilePreviewStrip({ listings }: MobilePreviewStripProps) {
  const previews = listings.slice(0, 4);

  if (previews.length === 0) return null;

  return (
    <section aria-label="معاينة السوق" className="mobile-home-featured">
      <MobileSectionHeader actionHref="/featured" icon="grid" title="معاينة السوق" />
      <p className="px-[var(--mh-page-x)] pb-1 text-xs font-medium text-[var(--mh-muted)]">
        إعلانات مميزة الآن — مختارة لك من سوقنا.
      </p>
      <DragScrollRow className="mobile-home-featured__track mobile-home-scroll flex w-full max-w-full flex-nowrap overflow-x-auto overscroll-x-contain">
        {previews.map((listing, index) => (
          <MobileFeaturedCard key={listing.id} listing={listing} priority={index < 2} />
        ))}
      </DragScrollRow>
    </section>
  );
}
