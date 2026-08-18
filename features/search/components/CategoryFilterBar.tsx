"use client";

import { useMemo, useRef } from "react";
import type { Category } from "@/types";
import { getCategoryFilterConfig } from "@/shared/constants/category-filters";
import { cities } from "@/shared/constants/locations";
import type { SearchFilterState } from "@/features/search/components/search-url";
import { priceBandFromRange } from "@/features/search/components/search-url";
import { Icon } from "@/shared/ui/Icon";
import "./category-filter-bar.css";

type CategoryFilterBarProps = {
  action: string;
  categories?: Category[];
  selectedFilters: SearchFilterState;
  showCategory?: boolean;
};

export function CategoryFilterBar({
  action,
  categories = [],
  selectedFilters,
  showCategory = false,
}: CategoryFilterBarProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const config = getCategoryFilterConfig(selectedFilters.category);
  const priceValue =
    selectedFilters.price ||
    priceBandFromRange(selectedFilters.minPrice, selectedFilters.maxPrice);

  const crumbs = useMemo(() => {
    const parts: string[] = [];
    if (selectedFilters.city) parts.push(selectedFilters.city);
    const categoryName = categories.find(
      (category) => category.id === selectedFilters.category,
    )?.name;
    if (categoryName) parts.push(categoryName);
    if (selectedFilters.specs?.brand) parts.push(selectedFilters.specs.brand);
    if (selectedFilters.specs?.model) parts.push(selectedFilters.specs.model);
    if (selectedFilters.specs?.propertyType) {
      parts.push(selectedFilters.specs.propertyType);
    }
    return parts;
  }, [categories, selectedFilters]);

  function submitSoon() {
    window.setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  return (
    <div className="category-filter-wrap">
      <form
        action={action}
        className="category-filter-bar"
        method="get"
        ref={formRef}
      >
        {selectedFilters.category && !showCategory ? (
          <input name="category" type="hidden" value={selectedFilters.category} />
        ) : null}
        {selectedFilters.sort && selectedFilters.sort !== "newest" ? (
          <input name="sort" type="hidden" value={selectedFilters.sort} />
        ) : null}

        {showCategory ? (
          <label className="category-filter-field">
            <span>القسم</span>
            <select
              defaultValue={selectedFilters.category ?? ""}
              name="category"
              onChange={submitSoon}
            >
              <option value="">كل الأقسام</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {config.primary.map((field) => {
          if (field.kind === "query") {
            return (
              <label className="category-filter-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  defaultValue={selectedFilters.query ?? ""}
                  name="q"
                  placeholder={field.placeholder}
                  type="search"
                />
              </label>
            );
          }

          if (field.kind === "text") {
            return (
              <label className="category-filter-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  defaultValue={selectedFilters.specs?.[field.key] ?? ""}
                  name={field.key}
                  placeholder={field.placeholder}
                  type="text"
                />
              </label>
            );
          }

          if (field.kind === "city") {
            return (
              <label className="category-filter-field" key={field.key}>
                <span>{field.label}</span>
                <select
                  defaultValue={selectedFilters.city ?? ""}
                  name="city"
                  onChange={submitSoon}
                >
                  <option value="">{field.placeholder ?? "اختر"}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.kind === "price") {
            return (
              <label className="category-filter-field" key={field.key}>
                <span>{field.label}</span>
                <select defaultValue={priceValue} name="price" onChange={submitSoon}>
                  <option value="">{field.placeholder ?? "اختر"}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          const value =
            field.key === "condition"
              ? (selectedFilters.condition ?? "")
              : (selectedFilters.specs?.[field.key] ?? "");

          return (
            <label className="category-filter-field" key={field.key}>
              <span>{field.label}</span>
              <select defaultValue={value} name={field.key} onChange={submitSoon}>
                <option value="">{field.placeholder ?? "اختر"}</option>
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}

        <button className="category-filter-submit" type="submit">
          <Icon name="search" size={16} />
          بحث
        </button>
      </form>

      {config.extra.length > 0 ? (
        <details className="category-filter-extra">
          <summary>
            <Icon name="filter" size={14} />
            فلاتر إضافية حسب القسم
          </summary>
          <form action={action} className="category-filter-extra-grid" method="get">
            {selectedFilters.category ? (
              <input name="category" type="hidden" value={selectedFilters.category} />
            ) : null}
            {selectedFilters.city ? (
              <input name="city" type="hidden" value={selectedFilters.city} />
            ) : null}
            {selectedFilters.query ? (
              <input name="q" type="hidden" value={selectedFilters.query} />
            ) : null}
            {selectedFilters.price ? (
              <input name="price" type="hidden" value={selectedFilters.price} />
            ) : null}
            {selectedFilters.minPrice ? (
              <input name="minPrice" type="hidden" value={selectedFilters.minPrice} />
            ) : null}
            {selectedFilters.maxPrice ? (
              <input name="maxPrice" type="hidden" value={selectedFilters.maxPrice} />
            ) : null}
            {Object.entries(selectedFilters.specs ?? {})
              .filter(([key]) => !config.extra.some((field) => field.key === key))
              .map(([key, value]) => (
                <input key={key} name={key} type="hidden" value={value} />
              ))}
            {config.extra.map((field) => (
              <label className="category-filter-field" key={field.key}>
                <span>{field.label}</span>
                {field.kind === "text" ? (
                  <input
                    defaultValue={selectedFilters.specs?.[field.key] ?? ""}
                    name={field.key}
                    placeholder={field.placeholder}
                    type="text"
                  />
                ) : (
                  <select
                    defaultValue={
                      field.key === "condition"
                        ? (selectedFilters.condition ?? "")
                        : (selectedFilters.specs?.[field.key] ?? "")
                    }
                    name={field.key}
                  >
                    <option value="">{field.placeholder ?? "الكل"}</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ))}
            <button className="category-filter-submit" type="submit">
              تطبيق
            </button>
          </form>
        </details>
      ) : null}

      {crumbs.length > 0 ? (
        <p className="category-filter-crumbs">{crumbs.join(" › ")}</p>
      ) : null}
    </div>
  );
}
