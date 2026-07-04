import type { Category, Listing } from "@/types";
import { FavoriteButton } from "@/shared/components/FavoriteButton";
import { ShareButton } from "@/shared/components/ShareButton";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ListingSummaryProps = {
  category?: Category;
  listing: Listing;
};

const conditionVariants: Record<Listing["condition"], "new" | "muted" | "premium"> = {
  excellent: "premium",
  new: "new",
  used: "muted",
};

const conditionLabels: Record<Listing["condition"], string> = {
  excellent: "ممتاز",
  new: "جديد",
  used: "مستعمل",
};

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export function ListingSummary({ category, listing }: ListingSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        {category ? <Badge variant="muted">{category.name}</Badge> : null}
        <Badge variant={conditionVariants[listing.condition]}>
          {conditionLabels[listing.condition]}
        </Badge>
      </div>

      <h1 className="mt-4 text-2xl font-black leading-tight text-ink md:text-3xl">
        {listing.title}
      </h1>

      <p className="mt-4 text-3xl font-semibold text-accent">
        {priceFormatter.format(listing.price)}{" "}
        <span className="text-sm font-medium text-muted">د.إ</span>
      </p>

      <div className="mt-6 grid gap-3 text-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="font-medium text-muted">الموقع</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <Icon name="map" size={14} />
            {listing.city}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted">المشاهدات</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <Icon name="eye" size={14} />
            {listing.views.toLocaleString("ar-AE")}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <Button fullWidth href={`/checkout?listing=${listing.slug}`} size="lg" variant="accent">
          شراء الآن
        </Button>
        <Button fullWidth href={`/chat?listing=${listing.slug}`} variant="secondary">
          محادثة البائع
        </Button>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <FavoriteButton className="w-full" />
        <ShareButton className="w-full" title={listing.title} />
      </div>
    </Card>
  );
}
