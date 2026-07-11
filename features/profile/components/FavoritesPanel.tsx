"use client";

import Link from "next/link";
import { useFavoritesList } from "@/shared/components/FavoriteButton";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";

export function FavoritesPanel() {
  const favorites = useFavoritesList();

  if (favorites.length === 0) {
    return (
      <EmptyState
        actionHref="/search"
        actionLabel="تصفح الإعلانات"
        description="احفظ الإعلانات التي تهمك للوصول إليها بسرعة."
        icon="package"
        title="لا توجد مفضلات بعد"
      />
    );
  }

  return (
    <ul className="grid gap-3">
      {favorites.map((item) => (
        <li key={item.listingId}>
          <Link href={`/listings/${item.slug}`}>
            <Card className="flex items-center justify-between gap-3 p-4 transition hover:border-primary/30" variant="flat">
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {new Date(item.savedAt).toLocaleDateString("ar-AE")}
                </p>
              </div>
              <CurrencyAmount amount={item.price} size="sm" />
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
