"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  clearRecentSearches,
  getRecentSearches,
} from "@/services/storage";
import { STORAGE_EVENTS } from "@/shared/constants/brand";
import { normalizeSearchText } from "@/shared/listings/search-text";
import type { IconName } from "@/shared/ui/Icon";
import { Icon } from "@/shared/ui/Icon";
import { buildSearchUrl, type SearchFilterState } from "./search-url";
import type { SearchSuggestion, SearchSuggestionKind } from "@/features/search/types";

export type { SearchSuggestion, SearchSuggestionKind };

const SUGGEST_DEBOUNCE_MS = 80;
const clientSuggestCache = new Map<string, SearchSuggestion[]>();

function suggestCacheKey(query: string, category?: string, city?: string) {
  return `${normalizeSearchText(query)}|${category ?? ""}|${city ?? ""}`;
}

function filterSuggestions(items: SearchSuggestion[], query: string) {
  const queryNorm = normalizeSearchText(query);
  if (!queryNorm) return items;
  return items.filter((suggestion) => {
    const labelNorm = normalizeSearchText(suggestion.label);
    return (
      labelNorm.includes(queryNorm) ||
      queryNorm.includes(labelNorm) ||
      labelNorm.split(/[^\p{L}\p{N}]+/u).some((token) => token.startsWith(queryNorm))
    );
  });
}

function readSuggestCache(query: string, category?: string, city?: string) {
  const exact = clientSuggestCache.get(suggestCacheKey(query, category, city));
  if (exact) return { exact: true, items: exact };

  for (let index = query.trim().length - 1; index >= 1; index -= 1) {
    const prefix = query.trim().slice(0, index);
    const cached = clientSuggestCache.get(suggestCacheKey(prefix, category, city));
    if (!cached) continue;
    const filtered = filterSuggestions(cached, query);
    if (filtered.length > 0) return { exact: false, items: filtered };
  }

  return { exact: false, items: [] as SearchSuggestion[] };
}

type SearchTypeaheadProps = {
  autoFocus?: boolean;
  compact?: boolean;
  defaultValue?: string;
  hideIcon?: boolean;
  inputClassName?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  selectedFilters?: SearchFilterState;
  suggestions?: SearchSuggestion[];
  variant?: "default" | "compact" | "hero" | "mobile" | "dock";
};

function kindLabel(kind: SearchSuggestionKind) {
  if (kind === "category") return "قسم";
  if (kind === "city") return "مدينة";
  if (kind === "listing") return "إعلان";
  if (kind === "brand") return "ماركة";
  if (kind === "model") return "موديل";
  if (kind === "recent") return "سابق";
  return "بحث";
}

function kindIcon(kind: SearchSuggestionKind): IconName {
  if (kind === "category") return "grid";
  if (kind === "city") return "map";
  if (kind === "listing") return "package";
  if (kind === "brand") return "star";
  if (kind === "model") return "star";
  if (kind === "recent") return "clock";
  return "search";
}

export function SearchTypeahead({
  autoFocus = false,
  compact = false,
  defaultValue = "",
  hideIcon = false,
  inputClassName,
  label = "كلمة البحث",
  name = "q",
  placeholder = "سيارة، هاتف، عقار...",
  selectedFilters = {},
  suggestions = [],
  variant = "default",
}: SearchTypeaheadProps) {
  const isCompact = compact || variant === "compact";
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [syncedDefault, setSyncedDefault] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [remote, setRemote] = useState<{
    failed: boolean;
    items: SearchSuggestion[];
    key: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  if (syncedDefault !== defaultValue) {
    setSyncedDefault(defaultValue);
    setValue(defaultValue);
  }

  useEffect(() => {
    const sync = () => setRecent(getRecentSearches());
    sync();
    window.addEventListener(STORAGE_EVENTS.recentSearchesChange, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.recentSearchesChange, sync);
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
    const cacheKey = suggestCacheKey(
      query,
      selectedFilters.category,
      selectedFilters.city,
    );
    if (!query) {
      abortRef.current?.abort();
      return;
    }

    if (clientSuggestCache.has(cacheKey)) {
      abortRef.current?.abort();
      return;
    }

    const timer = window.setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      const params = new URLSearchParams({ q: query });
      if (selectedFilters.category) params.set("category", selectedFilters.category);
      if (selectedFilters.city) params.set("city", selectedFilters.city);

      void fetch(`/api/search/suggest?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data: { items?: SearchSuggestion[] }) => {
          const nextItems = data.items ?? [];
          clientSuggestCache.set(cacheKey, nextItems);
          if (clientSuggestCache.size > 40) {
            const first = clientSuggestCache.keys().next().value;
            if (first) clientSuggestCache.delete(first);
          }
          setRemote({ failed: false, items: nextItems, key: cacheKey });
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setRemote({ failed: true, items: [], key: cacheKey });
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [selectedFilters.category, selectedFilters.city, value]);

  const items = useMemo(() => {
    const normalized = value.trim();
    if (!normalized) {
      return recent.slice(0, 5).map((query) => ({
        kind: "recent" as const,
        label: query,
        href: buildSearchUrl({ ...selectedFilters, query }),
      }));
    }

    const cacheKey = suggestCacheKey(
      normalized,
      selectedFilters.category,
      selectedFilters.city,
    );
    const cached = readSuggestCache(
      normalized,
      selectedFilters.category,
      selectedFilters.city,
    );
    if (cached.exact) return cached.items;
    if (cached.items.length > 0) return cached.items;
    if (remote?.key === cacheKey) {
      if (remote.failed) {
        return filterSuggestions(suggestions, normalized).slice(0, 8);
      }
      return remote.items;
    }
    return [];
  }, [recent, remote, selectedFilters, suggestions, value]);

  const queryKey = suggestCacheKey(
    value.trim(),
    selectedFilters.category,
    selectedFilters.city,
  );
  const exactCached = Boolean(value.trim()) && clientSuggestCache.has(queryKey);
  const resolvedForQuery = exactCached || remote?.key === queryKey;
  const showEmpty =
    open &&
    Boolean(value.trim()) &&
    items.length === 0 &&
    !loading &&
    resolvedForQuery &&
    !remote?.failed;
  const showLoading =
    open && Boolean(value.trim()) && items.length === 0 && !exactCached && (loading || !resolvedForQuery);
  const showList = open && (items.length > 0 || showEmpty || showLoading);
  const openUp = variant === "dock";

  function choose(item: SearchSuggestion) {
    setValue(item.label);
    setOpen(false);
    setActiveIndex(-1);
    if (item.href) {
      window.location.assign(item.href);
    }
  }

  const fieldClass =
    variant === "hero"
      ? "market-hero-search__field flex min-h-14 items-center gap-3 px-4"
      : variant === "mobile"
        ? "mobile-home-search-card__input-row w-full"
        : "";

  const controlClass =
    inputClassName ??
    (variant === "hero"
      ? "w-full bg-transparent text-base font-semibold text-ink outline-none placeholder:text-muted/50"
      : variant === "mobile"
        ? "mobile-home-search-card__input"
        : variant === "dock"
          ? "sticky-search-dock__input"
          : `focus-ring w-full min-w-0 rounded-[var(--radius-xl)] border border-border bg-surface text-ink shadow-[var(--shadow-xs)] placeholder:text-muted/70 transition ${
              isCompact
                ? "min-h-10 rounded-lg px-3 pe-9 py-2 text-xs font-medium leading-normal"
                : "min-h-11 px-4 pe-10 py-2.5 text-sm font-medium leading-normal"
            }`);

  return (
    <div ref={rootRef} className={`relative grid min-w-0 ${variant === "hero" || variant === "mobile" || variant === "dock" ? "gap-0" : "gap-1.5"} ${variant === "dock" ? "flex-1" : ""}`}>
      {label ? (
        <span
          className={
            isCompact ? "text-xs font-semibold text-muted" : "text-sm font-medium text-ink"
          }
        >
          {label}
        </span>
      ) : null}
      <div className={`relative ${fieldClass}`}>
        {variant === "hero" || variant === "mobile" ? (
          <Icon
            className={
              variant === "mobile"
                ? "mobile-home-search-card__search-icon"
                : "shrink-0 text-[#B8955F]"
            }
            name="search"
            size={variant === "mobile" ? 16 : 20}
          />
        ) : null}
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && items.length > 0}
          autoComplete="off"
          autoFocus={autoFocus}
          className={controlClass}
          name={name}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }
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
            }
          }}
          placeholder={placeholder}
          role="combobox"
          type="search"
          value={value}
        />
        {!hideIcon && variant !== "hero" && variant !== "mobile" && variant !== "dock" ? (
          <Icon
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted"
            name="search"
            size={isCompact ? 14 : 16}
          />
        ) : null}
      </div>

      {showList ? (
        <div
          className={`absolute inset-x-0 z-[60] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_32px_rgb(15_23_42/12%)] ${
            openUp
              ? "bottom-[calc(100%+0.35rem)]"
              : "top-[calc(100%+0.35rem)]"
          }`}
          id={listId}
          role="listbox"
        >
          {!value.trim() && recent.length > 0 ? (
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
              <p className="text-[0.7rem] font-bold text-muted">عمليات البحث الأخيرة</p>
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
          {showEmpty ? (
            <p className="px-3 py-4 text-sm font-medium text-muted">لا توجد اقتراحات مطابقة.</p>
          ) : showLoading ? (
            <p className="px-3 py-4 text-sm font-medium text-muted">جاري البحث...</p>
          ) : (
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
                        name={kindIcon(item.kind)}
                        size={14}
                      />
                      <span className="truncate font-semibold">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-[0.65rem] font-bold text-muted">
                      {kindLabel(item.kind)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
