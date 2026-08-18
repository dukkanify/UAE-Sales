"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { APP_STORE_LINKS, BRAND } from "@/shared/constants/brand";
import { footerLinks } from "@/shared/constants/navigation";
import { useT } from "@/shared/i18n/useLocale";
import type { MessageKey } from "@/shared/i18n/messages";
import { Icon } from "@/shared/ui/Icon";
import "./site-footer.css";

const trustBadges = [
  { icon: "shield" as const, labelKey: "footer.trustEscrow" as const },
  { icon: "wallet" as const, labelKey: "footer.trustPay" as const },
  { icon: "message" as const, labelKey: "footer.trustSupport" as const },
];

const quickActions = [
  { href: "/support", icon: "message" as const, labelKey: "footer.support" as const },
  { href: "/escrow", icon: "shield" as const, labelKey: "footer.trustEscrow" as const },
  { href: "/listings/new", icon: "plus" as const, labelKey: "action.addListing" as const },
];

const groupKeys: Record<string, MessageKey> = {
  السوق: "footer.group.market",
  الإمارات: "footer.group.emirates",
  حسابك: "footer.group.account",
  "الدعم والسياسات": "footer.group.support",
};

const linkKeys: Record<string, MessageKey> = {
  "/search": "footer.link.allAds",
  "/categories": "footer.link.categories",
  "/featured": "footer.link.featured",
  "/listings/new": "footer.link.add",
  "/login": "footer.link.login",
  "/register": "footer.link.register",
  "/dashboard/listings": "footer.link.myAds",
  "/dashboard/disputes": "footer.link.disputes",
  "/profile#notifications": "footer.link.notifications",
  "/escrow": "footer.link.escrowHow",
  "/support": "footer.link.contact",
  "/terms": "footer.link.terms",
  "/privacy": "footer.link.privacy",
};

type FooterGroup = (typeof footerLinks)[number];

function AppleGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24">
      <path
        d="M16.34 12.2c.02 2.14 1.88 2.86 1.9 2.87-.02.06-.29.98-.96 1.94-.58.83-1.18 1.65-2.12 1.67-.93.02-1.23-.55-2.3-.55-1.07 0-1.4.53-2.28.57-.92.04-1.62-.92-2.21-1.75-1.2-1.74-2.12-4.92-.87-7.07.62-1.08 1.73-1.76 2.94-1.78 1.02-.02 1.98.68 2.3.68.32 0 1.32-.84 2.22-.72.38.02 1.45.15 2.14 1.14-.05.03-1.28.75-1.26 2.24ZM13.9 4.4c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.22-.52.6-.97 1.57-.85 2.5.9.07 1.82-.46 2.38-1.16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 28.99 31.99">
      <path d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z" fill="#EA4335" />
      <path
        d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z"
        fill="#FBBC04"
      />
      <path d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z" fill="#4285F4" />
      <path
        d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z"
        fill="#34A853"
      />
    </svg>
  );
}

function StoreBadge({
  eyebrow,
  href,
  icon,
  label,
  title,
}: {
  eyebrow: string;
  href: string;
  icon: ReactNode;
  label: string;
  title: string;
}) {
  return (
    <Link
      aria-label={label}
      className="site-footer-store"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="site-footer-store__icon">{icon}</span>
      <span className="site-footer-store__copy">
        <span className="site-footer-store__eyebrow">{eyebrow}</span>
        <span className="site-footer-store__title">{title}</span>
      </span>
    </Link>
  );
}

function FooterLinkList({ links }: { links: FooterGroup["links"] }) {
  const t = useT();
  return (
    <ul className="site-footer__links">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link className="site-footer__link" href={link.href}>
            {linkKeys[link.href] ? t(linkKeys[link.href]) : link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterLinkGroup({ group }: { group: FooterGroup }) {
  const t = useT();
  const title = groupKeys[group.title] ? t(groupKeys[group.title]) : group.title;
  return (
    <>
      <details className="site-footer__accordion lg:hidden">
        <summary>
          {title}
          <Icon className="site-footer__chevron" name="chevron-left" size={16} />
        </summary>
        <div className="pb-3.5">
          <FooterLinkList links={group.links} />
        </div>
      </details>

      <div className="hidden lg:block">
        <h3 className="site-footer__group-title">{title}</h3>
        <FooterLinkList links={group.links} />
      </div>
    </>
  );
}

function TrustSeal() {
  const t = useT();
  return (
    <Link aria-label={t("footer.trustEscrow")} className="site-footer-seal" href="/escrow">
      <span>
        <span className="site-footer-seal__label">{t("footer.trustEscrow")}</span>
        <span className="site-footer-seal__sub">{BRAND.nameAr}</span>
      </span>
    </Link>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer aria-label={`${BRAND.nameAr} footer`} className="site-footer">
      <div className="site-footer__gold-line" />

      <section aria-label={t("footer.appKicker")} className="site-footer__app">
        <div className="app-container site-footer__app-inner">
          <div>
            <p className="site-footer__app-kicker">
              <Icon name="phone" size={14} />
              {t("footer.appKicker")}
            </p>
            <p className="site-footer__app-title">
              {t("footer.appLead")}
              <br />
              <em>{t("footer.appCta")}</em>
            </p>
          </div>

          <div aria-hidden className="site-footer__phones">
            <span className="site-footer__phone site-footer__phone--back">
              <span className="site-footer__phone-screen">
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
              </span>
            </span>
            <span className="site-footer__phone site-footer__phone--front">
              <span className="site-footer__phone-screen">
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
                <span className="site-footer__phone-bar" />
              </span>
            </span>
          </div>

          <div className="site-footer__stores">
            <StoreBadge
              eyebrow="Download on the"
              href={APP_STORE_LINKS.appStore}
              icon={<AppleGlyph />}
              label="حمّل من App Store"
              title="App Store"
            />
            <StoreBadge
              eyebrow="GET IT ON"
              href={APP_STORE_LINKS.playStore}
              icon={<PlayGlyph />}
              label="متوفر على Google Play"
              title="Google Play"
            />
          </div>
        </div>
      </section>

      <div className="app-container site-footer__main">
        <div className="site-footer__grid">
          <div>
            <BrandLogo href="/" showTagline size="md" />
            <p className="site-footer__brand-copy">{t("brand.description")}</p>
            <div className="site-footer__trust">
              {trustBadges.map((badge) => (
                <span className="site-footer__trust-chip" key={badge.labelKey}>
                  <Icon className="text-secondary" name={badge.icon} size={13} />
                  {t(badge.labelKey)}
                </span>
              ))}
            </div>
            <Link
              className="focus-ring sooqna-gold-gradient site-footer__cta inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-primary shadow-[0_8px_24px_rgb(201_169_98/28%)] transition hover:brightness-[1.03]"
              href="/listings/new"
            >
              <Icon name="plus" size={16} />
              {t("action.addListingFree")}
            </Link>
            <p className="mt-4 text-xs text-muted">
              <Link className="hover:text-ink" href={`mailto:${BRAND.supportEmail}`}>
                {BRAND.supportEmail}
              </Link>
            </p>
          </div>

          <nav aria-label="روابط التذييل" className="site-footer__nav">
            {footerLinks.map((group) => (
              <FooterLinkGroup group={group} key={group.title} />
            ))}
          </nav>
        </div>
      </div>

      <div className="site-footer__legal">
        <div className="app-container site-footer__legal-inner">
          <div className="min-w-0">
            <p className="site-footer__copyright">{t("footer.copyright")}</p>
            <p className="site-footer__credit">{t("footer.credit")}</p>
          </div>

          <div className="site-footer__actions">
            {quickActions.map((action) => (
              <Link className="site-footer__action" href={action.href} key={action.href}>
                <Icon className="text-secondary" name={action.icon} size={14} />
                {t(action.labelKey)}
              </Link>
            ))}
          </div>

          <TrustSeal />
        </div>
      </div>
    </footer>
  );
}
