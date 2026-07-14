"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";
import {
  HOME_SEARCH_LABELS,
  HOME_SEARCH_PRICE_OPTIONS,
} from "@/features/home/shared/home-search-fields";

type MobileSearchCardProps = {
  categories: Category[];
};

export function MobileSearchCard({ categories }: MobileSearchCardProps) {
  return (
    <section aria-label="البحث" className="mobile-home-search-card">
      <form action="/search" className="mobile-home-search-card__panel">
        <label className="mobile-home-search-card__input-row">
          <span className="sr-only">{HOME_SEARCH_LABELS.query}</span>
          <input
            className="mobile-home-search-card__input"
            name="q"
            placeholder={HOME_SEARCH_LABELS.queryPlaceholder}
            type="search"
          />
          <Icon className="mobile-home-search-card__search-icon" name="search" size={16} />
        </label>

        <div className="mobile-home-search-card__filters">
          <div className="mobile-home-search-card__filter-row">
            <label className="mobile-home-search-card__segment">
              <span className="mobile-home-search-card__segment-label">
                {HOME_SEARCH_LABELS.category}
              </span>
              <span className="mobile-home-search-card__segment-control">
                <Icon
                  aria-hidden
                  className="mobile-home-search-card__segment-icon"
                  name="grid"
                  size={11}
                />
                <select className="mobile-home-search-card__select" defaultValue="" name="category">
                  <option value="">{HOME_SEARCH_LABELS.categoryAll}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="mobile-home-search-card__segment">
              <span className="mobile-home-search-card__segment-label">
                {HOME_SEARCH_LABELS.city}
              </span>
              <span className="mobile-home-search-card__segment-control">
                <Icon
                  aria-hidden
                  className="mobile-home-search-card__segment-icon"
                  name="map"
                  size={11}
                />
                <select className="mobile-home-search-card__select" defaultValue="" name="city">
                  <option value="">{HOME_SEARCH_LABELS.cityAll}</option>
                  {cities.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>

          <div className="mobile-home-search-card__filter-row mobile-home-search-card__filter-row--action">
            <label className="mobile-home-search-card__segment">
              <span className="mobile-home-search-card__segment-label">
                {HOME_SEARCH_LABELS.price}
              </span>
              <span className="mobile-home-search-card__segment-control">
                <Icon
                  aria-hidden
                  className="mobile-home-search-card__segment-icon"
                  name="filter"
                  size={11}
                />
                <select className="mobile-home-search-card__select" defaultValue="" name="price">
                  {HOME_SEARCH_PRICE_OPTIONS.map((option) => (
                    <option key={option.value || "any"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <button className="mobile-home-search-card__submit" type="submit">
              <Icon aria-hidden name="search" size={15} />
              <span>{HOME_SEARCH_LABELS.submit}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
