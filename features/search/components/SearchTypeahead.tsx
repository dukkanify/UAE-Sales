"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  clearRecentSearches,
  getRecentSearches,
  getSavedSearches,
  type SavedSearch,
} from "@/services/storage";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { searchTextMatches } from "@/shared/listings/search-text";
import { Icon } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { buildSearchUrl, type SearchFilterState } from "./search-url";
import type { SearchSuggestion } from "@/features/search/types";

export type { SearchSuggestion };

type SearchTypeaheadProps = {
  compact?: boolean;
  defaultValue?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  selectedFilters?: SearchFilterState;
  suggestions?: SearchSuggestion[];
};

function kindLabel(kind: SearchSuggestion["kind"]) {
  if (kind === "category") return "قسم";
  if (kind === "city") return "إمارة";
  if (kind === "listing") return "إعلان";
  if (kind === "recent") return "سابق";
  if (kind === "saved") return "محفوظ";
  if (kind === "brand") return "ماركة";
  if (kind === "model") return "موديل";
  return "بحث";
}

export function SearchTypeahead({
  compact = false,
  defaultValue = "",
  label = "كلمة البحث",
  name = "q",
  placeholder = "سيارة، هاتف، عقار...",
  selectedFilters = {},
  suggestions = [],
}: SearchTypeaheadProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [syncedDefault, setSyncedDefault] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedSearch[]>([]);
  const [remote, setRemote] = useState<SearchSuggestion[]>([]);

  if (syncedDefault !== defaultValue) {
    setSyncedDefault(defaultValue);
    setValue(defaultValue);
  }

  useEffect(() => {
    const sync = () => {
      setRecent(getRecentSearches());
      setSaved(getSavedSearches());
    };
    sync();
    window.addEventListener(STORAGE_EVENTS.recentSearchesChange, sync);
    window.addEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.recentSearchesChange, sync);
      window.removeEventListener(STORAGE_EVENTS.savedSearchesChange, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (!query) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q: query });
      if (selectedFilters.category) params.set("category", selectedFilters.category);
      if (selectedFilters.city) params.set("city", selectedFilters.city);
      void fetch(`/api/search/suggest?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          const items = Array.isArray(data?.items) ? data.items : [];
          setRemote(items as SearchSuggestion[]);
        })
        .catch(() => {
          if (!controller.signal.aborted) setRemote([]);
        });
    }, 80);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [selectedFilters.category, selectedFilters.city, value]);

  const items = useMemo(() => {
    const normalized = value.trim().toLowerCase();
    const next: SearchSuggestion[] = [];

    if (!normalized) {
      for (const item of saved.slice(0, 5)) {
        next.push({
          kind: "saved",
          label: item.label,
          href: item.url,
        });
      }
      for (const query of recent.slice(0, 5)) {
        next.push({
          kind: "recent",
          label: query,
          href: buildSearchUrl({ ...selectedFilters, query }),
        });
      }
      return next;
    }

    for (const suggestion of remote) {
      next.push({
        ...suggestion,
        href:
          suggestion.href ??
          buildSearchUrl({ ...selectedFilters, query: suggestion.label }),
      });
      if (next.length >= 8) break;
    }

    if (next.length < 8) {
      for (const suggestion of suggestions) {
        if (!searchTextMatches(suggestion.label, normalized)) continue;
        if (next.some((item) => item.label === suggestion.label)) continue;
        next.push({
          ...suggestion,
          href:
            suggestion.href ??
            buildSearchUrl({ ...selectedFilters, query: suggestion.label }),
        });
        if (next.length >= 8) break;
      }
    }

    if (next.length === 0 && normalized.length >= 1) {
      next.push({
        kind: "query",
        label: value.trim(),
        href: buildSearchUrl({ ...selectedFilters, query: value.trim() }),
      });
    }

    return next;
  }, [recent, remote, saved, selectedFilters, suggestions, value]);

  function choose(item: SearchSuggestion) {
    setValue(item.label);
    setOpen(false);
    setActiveIndex(-1);
    if (item.href) {
      window.location.assign(item.href);
    }
  }

  return (
    <LocalizedTree>
    <div ref={rootRef} className="relative grid min-w-0 gap-1.5">
      {label ? (
        <span
          className={
            compact ? "text-xs font-semibold text-muted" : "text-sm font-medium text-ink"
          }
        >
          {label}
        </span>
      ) : null}
      <div className="relative">
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && items.length > 0}
          autoComplete="off"
          className={`focus-ring w-full min-w-0 rounded-[var(--radius-xl)] border border-border bg-surface text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/70 transition ${
            compact
              ? "min-h-10 rounded-lg px-3 pe-9 py-2 text-xs font-medium leading-normal"
              : "min-h-11 px-4 pe-10 py-2.5 text-sm font-medium leading-normal"
          }`}
          name={name}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open || items.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % items.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              choose(items[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          type="search"
          value={value}
        />
        <Icon
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
          name="search"
          size={compact ? 14 : 16}
        />
      </div>

      {open && items.length > 0 ? (
        <div
          className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_32px_rgb(15_23_42/12%)]"
          id={listId}
          role="listbox"
        >
          {!value.trim() && (saved.length > 0 || recent.length > 0) ? (
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
              <p className="text-[0.7rem] font-bold text-muted">
                {saved.length > 0 ? "محفوظة وأخيرة" : "عمليات البحث الأخيرة"}
              </p>
              <button
                className="text-[0.65rem] font-semibold text-muted hover:text-ink"
                onClick={() => {
                  clearRecentSearches();
                  setRecent([]);
                }}
                type="button"
              >
                مسح
              </button>
            </div>
          ) : (
            <p className="border-b border-border/70 px-3 py-2 text-[0.7rem] font-bold text-muted">
              اقتراحات
            </p>
          )}
          <ul className="max-h-64 overflow-auto py-1">
            {items.map((item, index) => (
              <li key={`${item.kind}-${item.label}-${index}`}>
                <Link
                  aria-selected={activeIndex === index}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition ${
                    activeIndex === index
                      ? "bg-secondary/15 text-ink"
                      : "text-ink hover:bg-surface-muted"
                  }`}
                  href={item.href ?? buildSearchUrl({ ...selectedFilters, query: item.label })}
                  onClick={(event) => {
                    event.preventDefault();
                    choose(item);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <Icon
                      className="shrink-0 text-secondary"
                      name={item.kind === "recent" ? "clock" : item.kind === "saved" ? "heart" : "search"}
                      size={14}
                    />
                    <span
                      className="truncate font-semibold"
                      data-ugc={
                        item.kind === "listing" ||
                        item.kind === "recent" ||
                        item.kind === "saved"
                          ? true
                          : undefined
                      }
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.65rem] font-bold text-muted">
                    {kindLabel(item.kind)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    </LocalizedTree>
  );
}
