"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@/types";
import { CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Icon } from "@/shared/ui/Icon";
import {
  categoryPageHref,
  categoryShortName,
  subcategoryPageHref,
} from "@/shared/layouts/header-nav";

type HeaderCategoryNavProps = {
  categories: Category[];
  onNavigate?: () => void;
};

export function HeaderCategoryMega({ categories }: HeaderCategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeTimer = useRef<number>(0);
  const active = categories.find((category) => category.id === activeId);

  function open(id: string) {
    window.clearTimeout(closeTimer.current);
    setActiveId(id);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActiveId(null), 140);
  }

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  return (
    <div
      className="app-header__cats-wrap"
      onMouseEnter={() => window.clearTimeout(closeTimer.current)}
      onMouseLeave={scheduleClose}
    >
      <nav aria-label="أقسام السوق" className="app-header__cats">
        {categories.map((category) => {
          const openMenu = activeId === category.id;
          return (
            <Link
              key={category.id}
              aria-expanded={openMenu}
              aria-haspopup="true"
              className={`app-header__cat${openMenu ? " is-open" : ""}`}
              href={categoryPageHref(category.slug)}
              onFocus={() => open(category.id)}
              onMouseEnter={() => open(category.id)}
            >
              <CategoryIcon category={category} size={14} />
              <span>{category.name}</span>
              {category.subcategories.length > 0 ? (
                <Icon className="app-header__cat-chevron" name="chevron-left" size={11} />
              ) : null}
            </Link>
          );
        })}
        <Link className="app-header__cat app-header__cat--all" href="/categories">
          كل الأقسام
        </Link>
      </nav>

      {active && active.subcategories.length > 0 ? (
        <div className="app-header__mega" role="region" aria-label={active.name}>
          <div className="app-header__mega-head">
            <div className="app-header__mega-title">
              <CategoryIcon category={active} size={18} />
              <span>{active.name}</span>
            </div>
            <Link className="app-header__mega-all" href={categoryPageHref(active.slug)}>
              عرض كل الإعلانات
              <Icon name="chevron-left" size={12} />
            </Link>
          </div>
          <div className="app-header__mega-grid">
            {active.subcategories.map((subcategory) => (
              <Link
                key={subcategory}
                className="app-header__mega-link"
                href={subcategoryPageHref(active.slug, subcategory)}
              >
                {subcategory}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderCategoryRail({ categories }: HeaderCategoryNavProps) {
  return (
    <nav aria-label="أقسام سريعة" className="app-header__rail">
      {categories.map((category) => (
        <Link
          key={category.id}
          className="app-header__rail-chip"
          href={categoryPageHref(category.slug)}
        >
          <CategoryIcon category={category} size={14} />
          <span>{categoryShortName(category.name)}</span>
        </Link>
      ))}
    </nav>
  );
}

export function HeaderCategoryAccordion({
  categories,
  onNavigate,
}: HeaderCategoryNavProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="app-header__accordion">
      <p className="app-header__accordion-label">الأقسام</p>
      {categories.map((category) => {
        const expanded = openId === category.id;
        const hasChildren = category.subcategories.length > 0;
        return (
          <div
            key={category.id}
            className={`app-header__acc-item${expanded ? " is-open" : ""}`}
          >
            <div className="app-header__acc-row">
              <Link
                className="app-header__acc-main"
                href={categoryPageHref(category.slug)}
                onClick={onNavigate}
              >
                <span className="app-header__acc-icon">
                  <CategoryIcon category={category} size={15} />
                </span>
                <span>{category.name}</span>
              </Link>
              {hasChildren ? (
                <button
                  aria-expanded={expanded}
                  aria-label={expanded ? "إخفاء الفروع" : "عرض الفروع"}
                  className="app-header__acc-toggle"
                  onClick={() => setOpenId(expanded ? null : category.id)}
                  type="button"
                >
                  <Icon name="chevron-left" size={14} />
                </button>
              ) : null}
            </div>
            {hasChildren && expanded ? (
              <div className="app-header__acc-children">
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory}
                    className="app-header__acc-child"
                    href={subcategoryPageHref(category.slug, subcategory)}
                    onClick={onNavigate}
                  >
                    {subcategory}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
