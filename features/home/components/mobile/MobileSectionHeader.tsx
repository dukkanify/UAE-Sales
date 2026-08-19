import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

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
<LocalizedTree>
    <div className="mobile-home-section-header">
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
  </LocalizedTree>
);
}

type MobileSectionProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

export function MobileSection({ ariaLabel, children, className = "" }: MobileSectionProps) {
  return (
<LocalizedTree>
    <section aria-label={ariaLabel} className={className}>
      {children}
    </section>
  </LocalizedTree>
);
}
