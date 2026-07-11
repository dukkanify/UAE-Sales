"use client";

import Link from "next/link";
import { useState } from "react";
import { STORAGE_KEYS } from "@/shared/constants/brand";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";

const STORAGE_KEY = STORAGE_KEYS.savedSearches;

type SavedSearch = {
  id: string;
  label: string;
  url: string;
};

type SavedSearchesProps = {
  currentUrl: string;
  currentLabel: string;
};

function loadSaved(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

function persistSaved(items: SavedSearch[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function SavedSearches({ currentLabel, currentUrl }: SavedSearchesProps) {
  const [saved, setSaved] = useState<SavedSearch[]>(() => loadSaved());
  const [message, setMessage] = useState("");

  function handleSave() {
    const exists = saved.some((item) => item.url === currentUrl);
    if (exists) {
      setMessage("هذا البحث محفوظ مسبقاً.");
      window.setTimeout(() => setMessage(""), 2500);
      return;
    }

    const next: SavedSearch = {
      id: `search-${Date.now()}`,
      label: currentLabel,
      url: currentUrl,
    };
    const updated = [next, ...saved].slice(0, 5);
    setSaved(updated);
    persistSaved(updated);
    setMessage("تم حفظ البحث.");
    window.setTimeout(() => setMessage(""), 2500);
  }

  function handleRemove(id: string) {
    const updated = saved.filter((item) => item.id !== id);
    setSaved(updated);
    persistSaved(updated);
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-ink">عمليات بحث محفوظة</p>
        <Button onClick={handleSave} size="sm" type="button" variant="ghost">
          <Icon name="heart" size={14} />
          حفظ البحث
        </Button>
      </div>

      {message ? (
        <div className="mt-2">
          <FormMessage variant="success">{message}</FormMessage>
        </div>
      ) : null}

      {saved.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {saved.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-xl)] bg-surface-muted px-3 py-2"
            >
              <Link
                className="min-w-0 flex-1 truncate text-xs font-semibold text-ink transition hover:text-primary"
                href={item.url}
              >
                {item.label}
              </Link>
              <button
                aria-label={`حذف ${item.label}`}
                className="focus-ring grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-error"
                onClick={() => handleRemove(item.id)}
                type="button"
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs font-medium text-muted">
          احفظ عمليات البحث المتكررة للوصول السريع.
        </p>
      )}
    </div>
  );
}
