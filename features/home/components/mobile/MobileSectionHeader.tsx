import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/shared/ui/Icon";

type MobileSectionHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
  icon?: IconName;
  title: string;
};

export function MobileSectionHeader({
  actionHref,
  actionLabel = "عرض الكل",
  icon,
  title,
}: MobileSectionHeaderProps) {
  return (
    <div className="mobile-home-section-header mobile-home-section px-4">
      <h2 className="mobile-home-section-header__title">
        {icon ? <Icon className="text-[var(--mh-gold)]" name={icon} size={16} /> : null}
        {title}
      </h2>
      {actionHref ? (
        <Link className="mobile-home-section-header__action" href={actionHref}>
          {actionLabel}
          <Icon name="chevron-left" size={14} />
        </Link>
      ) : null}
    </div>
  );
}

type MobileSectionProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

export function MobileSection({ ariaLabel, children, className = "" }: MobileSectionProps) {
  return (
    <section aria-label={ariaLabel} className={className}>
      {children}
    </section>
  );
}
