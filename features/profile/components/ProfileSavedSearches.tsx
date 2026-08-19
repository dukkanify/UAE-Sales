"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSavedSearches,
  removeSavedSearch,
  type SavedSearch,
} from "@/services/storage";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

export function ProfileSavedSearches() {
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const sync = () => setSaved(getSavedSearches());
    sync();
    window.addEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (saved.length === 0) {
    return (
<LocalizedTree>
      <EmptyState
        actionHref="/search"
        actionLabel="ابحث في السوق"
        description="من نتائج البحث اضغط «حفظ البحث» — القائمة تظهر هنا وفي صفحة البحث."
        icon="search"
        title="لا توجد عمليات بحث محفوظة"
      />
    </LocalizedTree>
);
  }

  return (
<LocalizedTree>
    <ul className="grid gap-2">
      {saved.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-2 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3"
        >
          <Link className="min-w-0 flex-1 truncate text-sm font-semibold text-ink" href={item.url}>
            {item.label}
          </Link>
          <button
            aria-label={`حذف ${item.label}`}
            className="focus-ring grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-error"
            onClick={() => setSaved(removeSavedSearch(item.id))}
            type="button"
          >
            <Icon name="close" size={14} />
          </button>
        </li>
      ))}
    </ul>
  </LocalizedTree>
);
}
