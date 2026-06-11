import Link from "next/link";
import type { Category, Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
    <Card className="overflow-hidden p-6">
      <div className="uae-flag-strip -mx-6 -mt-6 mb-6 h-2" />
      <div className="flex flex-wrap items-center gap-3">
        {category ? <Badge>{category.name}</Badge> : null}
        <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-black text-primary">
          الحالة: {conditionLabels[listing.condition]}
        </span>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-black text-uae-red">
          ضمان مالي 100%
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-black leading-tight text-ink md:text-4xl">
        {listing.title}
      </h1>
      <p className="mt-5 text-4xl font-black text-primary">
        {priceFormatter.format(listing.price)} د.إ
      </p>

      <div className="mt-6 grid gap-3 rounded-3xl border border-border bg-surface-muted p-4 text-sm font-bold text-muted sm:grid-cols-2">
        <div>
          <span className="block text-xs text-muted">الموقع</span>
          <span className="mt-1 block text-ink">
            {listing.city}، {listing.country}
          </span>
        </div>
        <div>
          <span className="block text-xs text-muted">حالة الإعلان</span>
          <span className="mt-1 block text-ink">نشط + محمي بالضمان</span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/checkout?listing=${listing.slug}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-black text-white shadow-[var(--shadow-soft)] transition hover:bg-primary-dark"
        >
          شراء الآن
        </Link>
        <Link
          href={`/chat?listing=${listing.slug}`}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-secondary/50 bg-white px-5 py-3 text-sm font-black text-ink transition hover:border-secondary hover:bg-secondary-soft"
        >
          محادثة البائع
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-black text-ink transition hover:border-secondary hover:bg-secondary-soft"
          type="button"
        >
          ♡ إضافة للمفضلة
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-white px-5 py-2.5 text-sm font-black text-ink transition hover:border-secondary hover:bg-secondary-soft"
          type="button"
        >
          مشاركة الإعلان
        </button>
      </div>
    </Card>
  );
}
