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
          <Icon className="shrink-0 text-[var(--mh-gold)]" name="search" size={18} />
        </label>

        <div className="mobile-home-search-card__filters">
          <label className="mobile-home-search-card__segment">
            <span className="mobile-home-search-card__segment-label">التصنيف</span>
            <span className="mobile-home-search-card__segment-value">
              <Icon className="text-[var(--mh-gold)]" name="grid" size={12} />
              <select className="mobile-home-search-card__select" defaultValue="" name="category">
                <option value="">كل التصنيفات</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="mobile-home-search-card__segment">
            <span className="mobile-home-search-card__segment-label">المدينة</span>
            <span className="mobile-home-search-card__segment-value">
              <Icon className="text-[var(--mh-gold)]" name="map" size={12} />
              <select className="mobile-home-search-card__select" defaultValue="دبي" name="city">
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="mobile-home-search-card__segment">
            <span className="mobile-home-search-card__segment-label">السعر</span>
            <span className="mobile-home-search-card__segment-value">
              <Icon className="text-[var(--mh-gold)]" name="filter" size={12} />
              <select className="mobile-home-search-card__select" defaultValue="" name="price">
                <option value="">أي سعر</option>
                <option value="0-50000">حتى 50,000</option>
                <option value="50000-200000">50K – 200K</option>
                <option value="200000+">200K+</option>
              </select>
            </span>
          </label>

          <button className="mobile-home-search-card__submit" type="submit">
            <Icon name="search" size={14} />
            بحث
          </button>
        </div>
      </form>
    </section>
  );
}
