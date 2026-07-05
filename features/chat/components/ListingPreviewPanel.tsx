import type { ChatConversation } from "@/types/domain/chat";
import { AppImage } from "@/shared/components/AppImage";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

type ListingPreviewPanelProps = {
  conversation: ChatConversation;
};

export function ListingPreviewPanel({ conversation }: ListingPreviewPanelProps) {
  return (
    <Card className="marketplace-panel p-4" variant="flat">
      <p className="text-xs font-semibold text-muted">الإعلان المرتبط</p>
      <div className="mt-3 flex gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-xl)]">
          <AppImage
            alt={conversation.listingTitle}
            className="object-cover"
            fallbackCategory="cars"
            fill
            sizes="64px"
            src={conversation.listingImageUrl}
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-ink">
            {conversation.listingTitle}
          </p>
          <p className="mt-1 text-sm font-bold text-primary">
            {priceFormatter.format(conversation.listingPrice)} د.إ
          </p>
          <Badge className="mt-2" variant="muted">
            {conversation.participantRole === "seller" ? "بائع" : "مشتري"}
          </Badge>
        </div>
      </div>
      <Button
        className="mt-4 w-full"
        href={`/listings/${conversation.listingSlug}`}
        size="sm"
        variant="secondary"
      >
        عرض الإعلان
      </Button>
    </Card>
  );
}
