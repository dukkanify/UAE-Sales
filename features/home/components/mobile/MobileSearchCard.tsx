"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type MobileSearchCardProps = {
  categories: Category[];
};

export function MobileSearchCard({ categories }: MobileSearchCardProps) {
  return (
    <section aria-label="البحث" className="mobile-home-search-card">
      <form action="/search" className="mobile-home-search-card__panel">
        <label className="mobile-home-search-card__input-row">
          <span className="sr-only">ابحث عن أي شيء</span>
          <input
            className="mobile-home-search-card__input"
            name="q"
            placeholder="ابحث عن أي شيء..."
            type="search"
          />
          <Icon className="mobile-home-search-card__search-icon" name="search" size={16} />
        </label>

        <div className="mobile-home-search-card__filters">
          <div className="mobile-home-search-card__filter-row">
            <label className="mobile-home-search-card__segment">
              <Icon aria-hidden className="mobile-home-search-card__segment-icon" name="grid" size={10} />
              <span className="mobile-home-search-card__segment-label">التصنيف</span>
              <select className="mobile-home-search-card__select" defaultValue="" name="category">
                <option value="">الكل</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mobile-home-search-card__segment">
              <Icon aria-hidden className="mobile-home-search-card__segment-icon" name="map" size={10} />
              <span className="mobile-home-search-card__segment-label">الموقع</span>
              <select className="mobile-home-search-card__select" defaultValue="دبي" name="city">
                {cities.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mobile-home-search-card__filter-row mobile-home-search-card__filter-row--action">
            <label className="mobile-home-search-card__segment">
              <Icon aria-hidden className="mobile-home-search-card__segment-icon" name="filter" size={10} />
              <span className="mobile-home-search-card__segment-label">السعر AED</span>
              <select className="mobile-home-search-card__select" defaultValue="" name="price">
                <option value="">أي سعر</option>
                <option value="0-50000">50K-</option>
                <option value="50000-200000">50-200K</option>
                <option value="200000+">200K+</option>
              </select>
            </label>

            <button className="mobile-home-search-card__submit" type="submit">
              <Icon aria-hidden name="search" size={15} />
              <span>بحث</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
