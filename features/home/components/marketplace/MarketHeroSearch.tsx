"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";
import { SearchTypeahead } from "@/features/search/components/SearchTypeahead";
import {
  HOME_SEARCH_LABELS,
  HOME_SEARCH_PRICE_OPTIONS,
} from "@/features/home/shared/home-search-fields";

type MarketHeroSearchProps = {
  categories: Category[];
};

export function MarketHeroSearch({ categories }: MarketHeroSearchProps) {
  return (
    <form
      action="/search"
      className="market-hero-search"
      data-search-anchor
    >
      <div className="market-hero-search__accent" />
      <div className="p-4 sm:p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr_auto] lg:items-end lg:gap-3">
          <div className="grid gap-1.5 sm:col-span-2 lg:col-span-1">
            <span className="market-hero-search__label">{HOME_SEARCH_LABELS.query}</span>
            <SearchTypeahead
              label=""
              name="q"
              placeholder={HOME_SEARCH_LABELS.queryPlaceholder}
              variant="hero"
            />
          </div>

          <label className="grid gap-1.5">
            <span className="market-hero-search__label">{HOME_SEARCH_LABELS.category}</span>
            <select
              className="market-hero-search__field min-h-14 w-full px-4 text-base font-semibold text-ink outline-none"
              defaultValue=""
              name="category"
            >
              <option value="">{HOME_SEARCH_LABELS.categoryAll}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="market-hero-search__label">{HOME_SEARCH_LABELS.city}</span>
            <select
              className="market-hero-search__field min-h-14 w-full px-4 text-base font-semibold text-ink outline-none"
              defaultValue=""
              name="city"
            >
              <option value="">{HOME_SEARCH_LABELS.cityAll}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="market-hero-search__label">{HOME_SEARCH_LABELS.price}</span>
            <select
              className="market-hero-search__field min-h-14 w-full px-4 text-base font-semibold text-ink outline-none"
              defaultValue=""
              name="price"
            >
              {HOME_SEARCH_PRICE_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="market-hero-search__submit sooqna-gold-gradient motion-press sm:col-span-2 lg:col-span-1"
            type="submit"
          >
            <Icon name="search" size={20} />
            {HOME_SEARCH_LABELS.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
