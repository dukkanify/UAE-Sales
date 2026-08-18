"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AppImage } from "@/shared/components/AppImage";
import {
  megaMenuCategories,
  type MegaLink,
  type MegaMenuCategory,
  type MegaService,
} from "@/shared/constants/mega-menu";
import { Icon } from "@/shared/ui/Icon";

const CLOSE_DELAY_MS = 140;

type CategoriesMegaMenuProps = {
  className?: string;
};

export function CategoriesMegaMenu({ className = "" }: CategoriesMegaMenuProps) {
  const menuId = useId();
  const closeTimer = useRef<number>(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [level1, setLevel1] = useState(0);
  const [level2, setLevel2] = useState<number | null>(null);

  const active = megaMenuCategories.find((category) => category.id === openId);

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  function openCategory(id: string) {
    cancelClose();
    if (openId !== id) {
      setLevel1(0);
      setLevel2(null);
    }
    setOpenId(id);
  }

  function closeNow() {
    cancelClose();
    setOpenId(null);
    setLevel2(null);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(closeNow, CLOSE_DELAY_MS);
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.clearTimeout(closeTimer.current);
        setOpenId(null);
        setLevel2(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openId]);

  const l1Item = active?.items[level1];
  const l2Children = l1Item?.children ?? [];
  const l2Item = level2 !== null ? l2Children[level2] : undefined;
  const l3Children = l2Item?.children ?? [];
  const showL2 = Boolean(active && l2Children.length);
  const showL3 = Boolean(showL2 && l3Children.length);

  return (
    <div
      className={`sooqna-mega${openId ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <div className="sooqna-mega__bar">
        <nav aria-label="أقسام السوق" className="app-container sooqna-mega__tabs">
          {megaMenuCategories.map((category) => {
            const isOpen = openId === category.id;
            return (
              <Link
                key={category.id}
                aria-controls={`${menuId}-${category.id}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`sooqna-mega__tab${isOpen ? " is-open" : ""}`}
                href={category.href}
                onFocus={() => openCategory(category.id)}
                onMouseEnter={() => openCategory(category.id)}
              >
                {category.badge === "new" ? (
                  <span className="sooqna-mega__tab-new">جديد</span>
                ) : null}
                {category.label}
              </Link>
            );
          })}
          <Link className="sooqna-mega__tab sooqna-mega__tab--all" href="/categories">
            كل الأقسام
          </Link>
        </nav>
      </div>

      {active ? (
        <>
          <button
            aria-label="إغلاق قائمة الأقسام"
            className="sooqna-mega__overlay"
            onClick={closeNow}
            onMouseEnter={closeNow}
            type="button"
          />
          <div
            className="sooqna-mega__panel"
            id={`${menuId}-${active.id}`}
            role="region"
            aria-label={active.label}
          >
            <div
              className={`app-container sooqna-mega__cols${showL3 ? " has-l3" : showL2 ? " has-l2" : ""}`}
            >
              <MegaColumnPrimary
                category={active}
                level1={level1}
                onHoverItem={(index) => {
                  setLevel1(index);
                  setLevel2(null);
                }}
              />

              {showL2 && l1Item ? (
                <MegaColumnGrid
                  heading={l1Item.label}
                  href={l1Item.href}
                  items={l2Children}
                  activeIndex={level2}
                  compact={showL3}
                  onHoverItem={(index) => setLevel2(index)}
                />
              ) : (
                <MegaColumnFallback category={active} />
              )}

              {showL3 && l2Item ? (
                <MegaColumnList
                  heading={l2Item.label}
                  href={l2Item.href}
                  items={l3Children}
                  activeIndex={null}
                />
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MegaBadge({ badge }: { badge?: MegaLink["badge"] }) {
  if (badge !== "new") return null;
  return <span className="sooqna-mega__badge">جديد</span>;
}

function MegaColumnPrimary({
  category,
  level1,
  onHoverItem,
}: {
  category: MegaMenuCategory;
  level1: number;
  onHoverItem: (index: number) => void;
}) {
  return (
    <div className="sooqna-mega__col sooqna-mega__col--primary">
      <ul className="sooqna-mega__list">
        {category.items.map((item, index) => {
          const active = index === level1;
          const hasChildren = Boolean(item.children?.length);
          return (
            <li key={item.href + item.label}>
              <Link
                className={`sooqna-mega__item${active ? " is-active" : ""}`}
                href={item.href}
                onFocus={() => onHoverItem(index)}
                onMouseEnter={() => onHoverItem(index)}
              >
                <span className="sooqna-mega__item-label">
                  {item.label}
                  <MegaBadge badge={item.badge} />
                </span>
                {hasChildren ? (
                  <Icon className="sooqna-mega__chevron" name="chevron-left" size={14} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {category.promo ? (
        <Link className="sooqna-mega__promo" href={category.promo.href}>
          <span className="sooqna-mega__promo-media">
            <AppImage
              alt={category.promo.imageAlt}
              className="sooqna-mega__promo-img"
              fill
              sizes="220px"
              src={category.promo.imageUrl}
            />
          </span>
          <span className="sooqna-mega__promo-copy">
            <span className="sooqna-mega__promo-kicker">{category.promo.kicker}</span>
            <span className="sooqna-mega__promo-title">{category.promo.title}</span>
          </span>
        </Link>
      ) : null}

      {category.services?.length ? (
        <div className="sooqna-mega__services">
          <p className="sooqna-mega__services-label">خدمات سوقنا</p>
          <div className="sooqna-mega__services-grid">
            {category.services.map((service) => (
              <ServiceTile key={service.label} service={service} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MegaColumnFallback({ category }: { category: MegaMenuCategory }) {
  return (
    <div className="sooqna-mega__col sooqna-mega__col--wide sooqna-mega__col--empty">
      <div className="sooqna-mega__col-head">
        <p className="sooqna-mega__col-title">{category.label}</p>
        <Link className="sooqna-mega__view-all" href={category.href}>
          مشاهدة الكل
          <Icon name="chevron-left" size={12} />
        </Link>
      </div>
      <p className="sooqna-mega__empty-copy">تصفّح كل إعلانات {category.label} في سوقنا.</p>
    </div>
  );
}

function MegaColumnGrid({
  heading,
  href,
  items,
  activeIndex,
  compact,
  onHoverItem,
}: {
  heading: string;
  href: string;
  items: MegaLink[];
  activeIndex: number | null;
  compact?: boolean;
  onHoverItem?: (index: number) => void;
}) {
  return (
    <div className={`sooqna-mega__col sooqna-mega__col--wide${compact ? " is-compact" : ""}`}>
      <div className="sooqna-mega__col-head">
        <p className="sooqna-mega__col-title">{heading}</p>
        <Link className="sooqna-mega__view-all" href={href}>
          مشاهدة الكل
          <Icon name="chevron-left" size={12} />
        </Link>
      </div>
      <ul className="sooqna-mega__grid">
        {items.map((item, index) => {
          const active = activeIndex === index;
          const hasChildren = Boolean(item.children?.length);
          return (
            <li key={item.href + item.label}>
              <Link
                className={`sooqna-mega__grid-item${active ? " is-active" : ""}`}
                href={item.href}
                onFocus={() => onHoverItem?.(index)}
                onMouseEnter={() => onHoverItem?.(index)}
              >
                <span className="sooqna-mega__item-label">
                  {item.label}
                  <MegaBadge badge={item.badge} />
                </span>
                {hasChildren ? (
                  <Icon className="sooqna-mega__chevron" name="chevron-left" size={12} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MegaColumnList({
  heading,
  href,
  items,
  activeIndex,
  onHoverItem,
}: {
  heading: string;
  href: string;
  items: MegaLink[];
  activeIndex: number | null;
  onHoverItem?: (index: number) => void;
}) {
  return (
    <div className="sooqna-mega__col sooqna-mega__col--list">
      <div className="sooqna-mega__col-head">
        <p className="sooqna-mega__col-title">{heading}</p>
        <Link className="sooqna-mega__view-all" href={href}>
          مشاهدة الكل
          <Icon name="chevron-left" size={12} />
        </Link>
      </div>
      <ul className="sooqna-mega__list sooqna-mega__list--scroll">
        {items.map((item, index) => {
          const active = activeIndex === index;
          const hasChildren = Boolean(item.children?.length);
          return (
            <li key={item.href + item.label}>
              <Link
                className={`sooqna-mega__item${active ? " is-active" : ""}`}
                href={item.href}
                onFocus={() => onHoverItem?.(index)}
                onMouseEnter={() => onHoverItem?.(index)}
              >
                <span className="sooqna-mega__item-label">
                  {item.label}
                  <MegaBadge badge={item.badge} />
                </span>
                {hasChildren ? (
                  <Icon className="sooqna-mega__chevron" name="chevron-left" size={14} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ServiceTile({ service }: { service: MegaService }) {
  return (
    <Link
      className={`sooqna-mega__service sooqna-mega__service--${service.tone}`}
      href={service.href}
    >
      <span className="sooqna-mega__service-icon">
        <Icon name={service.icon} size={16} />
      </span>
      <span>{service.label}</span>
    </Link>
  );
}

type CategoriesMobileAccordionProps = {
  onNavigate?: () => void;
};

export function CategoriesMobileAccordion({
  onNavigate,
}: CategoriesMobileAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="sooqna-mega-acc">
      <p className="sooqna-mega-acc__label">الأقسام</p>
      {megaMenuCategories.map((category) => {
        const expanded = openId === category.id;
        return (
          <div
            className={`sooqna-mega-acc__item${expanded ? " is-open" : ""}`}
            key={category.id}
          >
            <div className="sooqna-mega-acc__row">
              <Link
                className="sooqna-mega-acc__main"
                href={category.href}
                onClick={onNavigate}
              >
                <span className="sooqna-mega-acc__icon">
                  <Icon name={category.icon} size={15} />
                </span>
                <span>{category.label}</span>
                {category.badge === "new" ? <MegaBadge badge="new" /> : null}
              </Link>
              {category.items.length ? (
                <button
                  aria-expanded={expanded}
                  aria-label={expanded ? `إخفاء ${category.label}` : `عرض ${category.label}`}
                  className="sooqna-mega-acc__toggle"
                  onClick={() => setOpenId(expanded ? null : category.id)}
                  type="button"
                >
                  <Icon name="chevron-left" size={14} />
                </button>
              ) : null}
            </div>
            {expanded ? (
              <div className="sooqna-mega-acc__children">
                {category.items.map((item) => (
                  <Link
                    className="sooqna-mega-acc__child"
                    href={item.href}
                    key={item.href + item.label}
                    onClick={onNavigate}
                  >
                    {item.label}
                    <MegaBadge badge={item.badge} />
                  </Link>
                ))}
                <Link
                  className="sooqna-mega-acc__child sooqna-mega-acc__child--all"
                  href={category.href}
                  onClick={onNavigate}
                >
                  مشاهدة كل {category.label}
                </Link>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
