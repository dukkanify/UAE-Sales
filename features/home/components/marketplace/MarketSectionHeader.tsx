import type { ReactNode } from "react";
import Link from "next/link";

type MarketSectionHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function MarketSectionHeader({
  actionHref,
  actionLabel = "عرض المزيد",
  description,
  eyebrow,
  title,
}: MarketSectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-bold text-[#B8955F]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-base leading-7 text-muted">{description}</p>
        ) : null}
      </div>
      {actionHref ? (
        <Link
          className="shrink-0 text-sm font-bold text-[#B8955F] hover:text-[#9a7d4a]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function MarketSectionShell({
  children,
  variant = "sand",
}: {
  children: ReactNode;
  variant?: "sand" | "white";
}) {
  return (
    <section
      className={`py-16 md:py-20 ${variant === "sand" ? "bg-[#fdfbf7]" : "bg-white"}`}
    >
      <div className="app-container">{children}</div>
    </section>
  );
}
