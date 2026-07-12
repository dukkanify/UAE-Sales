"use client";

import type { Category } from "@/types";
import { cities } from "@/shared/constants/locations";
import { Icon } from "@/shared/ui/Icon";

type MobileHeroSearchProps = {
  categories: Category[];
};

export function MobileHeroSearch({ categories }: MobileHeroSearchProps) {
  return (
    <form action="/search" className="mobile-home-hero-search">
      <label className="mobile-home-hero-search__input-wrap">
        <Icon className="text-secondary" name="search" size={18} />
        <input
          className="mobile-home-hero-search__input"
          name="q"
          placeholder="ابحث عن سيارات، عقارات، إلكترونيات..."
          type="search"
        />
      </label>

      <div className="mobile-home-hero-search__filters">
        <button className="mobile-home-hero-search__filter mobile-home-hero-search__filter--primary" type="submit">
          <Icon name="search" size={14} />
          بحث
        </button>

        <label className="mobile-home-hero-search__filter">
          <span className="text-muted">السعر</span>
          <select className="mobile-home-hero-search__select" defaultValue="" name="price">
            <option value="">أي سعر</option>
            <option value="0-50000">حتى 50,000</option>
            <option value="50000-200000">50K – 200K</option>
            <option value="200000+">200K+</option>
          </select>
        </label>

        <label className="mobile-home-hero-search__filter">
          <Icon className="text-secondary" name="map" size={13} />
          <select className="mobile-home-hero-search__select" defaultValue="دبي" name="city">
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </label>

        <label className="mobile-home-hero-search__filter">
          <Icon className="text-secondary" name="grid" size={13} />
          <select className="mobile-home-hero-search__select" defaultValue="" name="category">
            <option value="">كل التصنيفات</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
