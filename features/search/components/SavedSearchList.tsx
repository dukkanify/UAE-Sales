"use client";

import Link from "next/link";
import { useState } from "react";
import { mockCategories } from "@/mock/categories.mock";
import {
  formatSavedSearchLastUsed,
  summarizeSavedSearchFilters,
  type SavedSearch,
} from "@/services/saved-searches/identity";
import { useLocale } from "@/shared/i18n/useLocale";
import { Icon } from "@/shared/ui/Icon";

const PREVIEW_COUNT = 5;

type SavedSearchListProps = {
  items: SavedSearch[];
  onOpen?: (item: SavedSearch) => void;
  onRemove: (item: SavedSearch) => void;
};

export function SavedSearchList({ items, onOpen, onRemove }: SavedSearchListProps) {
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <div>
      <ul className="mt-2 grid gap-1">
        {visible.map((item) => {
          const filters = {
            ...item.filters,
            category:
              mockCategories.find((category) => category.id === item.filters.category)?.name ??
              item.filters.category,
          };
          const summary = summarizeSavedSearchFilters(filters);
          const lastUsed = formatSavedSearchLastUsed(item.lastUsedAt, locale);
          return (
            <li
              key={item.id}
              className="flex items-center gap-1 rounded-lg border border-border/70 bg-surface px-2 py-1"
            >
              <Link
                className="min-w-0 flex-1 leading-tight"
                href={item.url}
                onClick={() => onOpen?.(item)}
              >
                <span className="block truncate text-xs font-semibold text-ink">{item.label}</span>
                {summary || lastUsed ? (
                  <span className="mt-0.5 block truncate text-[10px] font-medium text-muted">
                    {summary}
                    {summary && lastUsed ? " · " : ""}
                    {lastUsed}
                  </span>
                ) : null}
              </Link>
              <Link
                aria-label={locale === "en" ? `Open ${item.label}` : `فتح ${item.label}`}
                className="focus-ring shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-secondary-soft"
                href={item.url}
                onClick={() => onOpen?.(item)}
              >
                {locale === "en" ? "Open" : "فتح"}
              </Link>
              <button
                aria-label={locale === "en" ? `Delete ${item.label}` : `حذف ${item.label}`}
                className="focus-ring grid size-6 shrink-0 place-items-center rounded-md text-muted transition hover:bg-surface-muted hover:text-error"
                onClick={() => onRemove(item)}
                type="button"
              >
                <Icon name="close" size={11} />
              </button>
            </li>
          );
        })}
      </ul>
      {items.length > PREVIEW_COUNT ? (
        <button
          className="mt-1.5 text-[11px] font-semibold text-primary hover:underline"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded
            ? locale === "en"
              ? "Show less"
              : "عرض أقل"
            : locale === "en"
              ? `Show all (${items.length})`
              : `عرض الكل (${items.length})`}
        </button>
      ) : null}
    </div>
  );
}
