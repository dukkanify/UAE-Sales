import Link from "next/link";
import type { Category, Listing } from "@/types";
import { FavoriteButton } from "@/components/common/FavoriteButton";
import { ShareButton } from "@/components/common/ShareButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type ListingSummaryProps = {
  category?: Category;
  listing: Listing;
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
        {category ? <Badge variant="gold">{category.name}</Badge> : null}
        <Badge variant="muted">{conditionLabels[listing.condition]}</Badge>
        <Badge variant="success">ضمان مالي</Badge>
      </div>

      <h1 className="mt-4 text-2xl font-black leading-tight text-ink md:text-3xl">
        {listing.title}
      </h1>

      <p className="mt-4 text-3xl font-black text-accent">
        {priceFormatter.format(listing.price)}{" "}
        <span className="text-sm font-medium text-muted">د.إ</span>
      </p>

      <div className="mt-5 grid gap-2 rounded-[var(--radius-md)] border border-border bg-surface-muted p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted">الموقع</span>
          <span className="inline-flex items-center gap-1 font-bold text-ink">
            <Icon name="map" size={14} />
            {listing.city}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-muted">المشاهدات</span>
          <span className="inline-flex items-center gap-1 font-bold text-ink">
            <Icon name="eye" size={14} />
            {listing.views.toLocaleString("ar-AE")}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link href={`/checkout?listing=${listing.slug}`}>
          <Button className="w-full" variant="accent">
            شراء الآن
          </Button>
        </Link>
        <Link href={`/chat?listing=${listing.slug}`}>
          <Button className="w-full" variant="secondary">
            محادثة البائع
          </Button>
        </Link>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <FavoriteButton className="w-full" />
        <ShareButton className="w-full" title={listing.title} />
      </div>
    </Card>
  );
}
