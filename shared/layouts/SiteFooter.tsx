import Link from "next/link";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { BRAND } from "@/shared/constants/brand";
import { footerLinks } from "@/shared/constants/navigation";
import { Icon } from "@/shared/ui/Icon";

const trustBadges = [
  { icon: "shield" as const, label: "ضمان مالي" },
  { icon: "wallet" as const, label: "دفع آمن" },
  { icon: "message" as const, label: "دعم 24/7" },
];

const quickActions = [
  { href: "/support", icon: "message" as const, label: "الدعم" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان المالي" },
  { href: "/listings/new", icon: "plus" as const, label: "أضف إعلانك" },
];

type FooterGroup = (typeof footerLinks)[number];

function FooterLinkList({ links }: { links: FooterGroup["links"] }) {
  return (
    <ul className="grid gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            className="inline-flex min-h-9 items-center text-sm font-medium text-muted transition hover:text-ink"
            href={link.href}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterLinkGroup({ group }: { group: FooterGroup }) {
  return (
    <>
      <details className="group border-b border-border/60 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
          {group.title}
          <Icon
            className="text-muted transition duration-200 group-open:rotate-180"
            name="chevron-left"
            size={16}
          />
        </summary>
        <div className="pb-4">
          <FooterLinkList links={group.links} />
        </div>
      </details>

      <div className="hidden lg:block">
        <h3 className="text-sm font-bold text-ink">{group.title}</h3>
        <div className="mt-4">
          <FooterLinkList links={group.links} />
        </div>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-gradient-to-b from-surface-muted/50 to-surface">
      <div className="app-container section-padding pb-6 pt-8 md:pt-10">
        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-border/70 bg-surface shadow-[var(--shadow-sm)]">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_1.85fr] lg:gap-10">
            <div className="space-y-5">
              <BrandLogo href="/" showTagline={false} size="md" />
              <p className="max-w-sm text-sm leading-7 text-muted">{BRAND.description}</p>
              <div className="flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-muted/80 px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    <Icon className="text-secondary" name={badge.icon} size={13} />
                    {badge.label}
                  </span>
                ))}
              </div>
              <Link
                className="focus-ring sooqna-gold-gradient inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-primary shadow-[0_8px_24px_rgb(201_169_98/28%)] transition hover:brightness-[1.03]"
                href="/listings/new"
              >
                <Icon name="plus" size={16} />
                أضف إعلانك مجاناً
              </Link>
            </div>

            <div className="grid gap-0 lg:grid-cols-3 lg:gap-8">
              {footerLinks.map((group) => (
                <FooterLinkGroup key={group.title} group={group} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/60 bg-surface-muted/40 px-6 py-4 md:px-8 lg:hidden">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                className="focus-ring inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-surface px-3 text-xs font-semibold text-ink transition hover:border-secondary/40 hover:bg-secondary-soft/50 sm:flex-none"
                href={action.href}
              >
                <Icon className="text-secondary" name={action.icon} size={14} />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-muted">{BRAND.copyright}</p>
          <div className="hidden items-center gap-2 sm:flex">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border/70 bg-surface px-3.5 text-xs font-semibold text-muted transition hover:border-secondary/40 hover:text-ink"
                href={action.href}
              >
                <Icon name={action.icon} size={14} />
                {action.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted/80">صُمم في الإمارات 🇦🇪</p>
        </div>
      </div>
    </footer>
  );
}
