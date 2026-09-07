"use client";

import Link from "next/link";
import { Copy } from "@/shared/i18n/LocalizedTree";
import { useTx } from "@/shared/i18n/useTx";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const t = useTx();
  return (
    <nav
      aria-label={t("مسار التنقل")}
      className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-muted"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-border">
                /
              </span>
            ) : null}
            {item.href && !isLast ? (
              <Link className="transition hover:text-ink" href={item.href}>
                <Copy text={item.label} />
              </Link>
            ) : (
              <span className={isLast ? "text-ink" : undefined}>
                <Copy text={item.label} />
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
