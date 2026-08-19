import Link from "next/link";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { BrandMark } from "@/shared/components/BrandMark";
import { BRAND, DEVELOPER } from "@/shared/constants/brand";
import { footerLinks } from "@/shared/constants/navigation";
import { LanguageSwitch } from "@/shared/i18n/LanguageSwitch";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Icon } from "@/shared/ui/Icon";
import "./site-footer.css";

type FooterGroup = (typeof footerLinks)[number];

const storeBadges = [
  { id: "app-store", eyebrow: "Coming soon", title: "App Store" },
  { id: "google-play", eyebrow: "Coming soon", title: "Google Play" },
] as const;

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
    <svg aria-hidden viewBox="0 0 24 24">
      <path d="M4 3.5v17l13.5-8.5L4 3.5Z" fill="currentColor" />
    </svg>
  );
}

function storeIcon(id: (typeof storeBadges)[number]["id"]) {
  if (id === "google-play") return <PlayGlyph />;
  return <AppleGlyph />;
}

function InstagramGlyph() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 24 24" width="16">
      <rect height="18" rx="5" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" fill="currentColor" r="1.05" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="M14.5 8.5V6.8c0-.7.5-1 1.2-1H17V3.2h-2.1C12.3 3.2 11 4.7 11 6.7v1.8H9v2.6h2V21h3.5v-9.9h2.3l.4-2.6h-2.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg aria-hidden fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path
        d="M16.8 4h2.6l-5.7 6.5L20.4 20h-4.7l-3.7-4.8L7.4 20H4.8l6.1-7L3.7 4h4.8l3.3 4.4L16.8 4Zm-.9 14.4h1.5L8.2 5.5H6.6l9.3 12.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

const socialSoon = [
  { id: "instagram", label: "Instagram", icon: <InstagramGlyph /> },
  { id: "facebook", label: "Facebook", icon: <FacebookGlyph /> },
  { id: "x", label: "X", icon: <XGlyph /> },
] as const;

function FooterLinkList({ links }: { links: FooterGroup["links"] }) {
  return (
    <ul className="site-footer__list">
      {links.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link className="site-footer__link" href={link.href}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SocialColumn() {
  return (
    <>
      <div className="site-footer__social" role="group" aria-label="حسابات سوقنا على وسائل التواصل">
        {socialSoon.map((item) => (
          <span
            key={item.id}
            aria-label={`${item.label} — قريبًا`}
            className="site-footer__social-btn"
            title={`${item.label} — قريبًا`}
          >
            {item.icon}
          </span>
        ))}
      </div>
      <p className="site-footer__social-note">حساباتنا الرسمية قريبًا — بلا روابط وهمية.</p>
    </>
  );
}

function StoreBadges() {
  return (
    <div className="site-footer__stores">
      {storeBadges.map((store) => (
        <button
          key={store.id}
          aria-label={`تطبيق سوقنا على ${store.title} — قريبًا`}
          className="site-footer__store"
          disabled
          title="التطبيق غير منشور بعد"
          type="button"
        >
          <span className="site-footer__store-icon">{storeIcon(store.id)}</span>
          <span className="site-footer__store-copy" dir="ltr">
            <span className="site-footer__store-eyebrow">{store.eyebrow}</span>
            <span className="site-footer__store-title">{store.title}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <LocalizedTree>
    <footer className="site-footer">
      <section aria-label="تطبيق سوقنا" className="site-footer__app">
        <div className="app-container site-footer__app-inner">
          <div className="site-footer__app-copy">
            <h2 className="site-footer__app-title">سوقنا معك في كل مكان</h2>
            <p className="site-footer__app-sub">حمّل تطبيق سوقنا</p>
            <div className="lg:hidden">
              <StoreBadges />
            </div>
          </div>

          <div aria-hidden className="site-footer__phones">
            <div className="site-footer__phone site-footer__phone--back">
              <div className="site-footer__phone-screen">
                <BrandMark size={22} variant="gold" />
                <span className="site-footer__phone-label">{BRAND.nameAr}</span>
              </div>
            </div>
            <div className="site-footer__phone site-footer__phone--front">
              <div className="site-footer__phone-screen">
                <BrandMark size={26} variant="default" />
                <span className="site-footer__phone-label">{BRAND.nameEn}</span>
              </div>
            </div>
          </div>

          <div className="site-footer__stores-slot hidden lg:flex">
            <StoreBadges />
          </div>
        </div>
      </section>

      <nav aria-label="روابط التذييل" className="app-container site-footer__nav">
        <div className="site-footer__mobile-cols">
          {footerLinks.map((group) => (
            <details key={group.title} className="site-footer__accordion group">
              <summary>
                {group.title}
                <Icon
                  className="text-muted transition duration-200 group-open:-rotate-90"
                  name="chevron-left"
                  size={16}
                />
              </summary>
              <div className="site-footer__accordion-body">
                <FooterLinkList links={group.links} />
              </div>
            </details>
          ))}
          <details className="site-footer__accordion group">
            <summary>
              تابعنا
              <Icon
                className="text-muted transition duration-200 group-open:-rotate-90"
                name="chevron-left"
                size={16}
              />
            </summary>
            <div className="site-footer__accordion-body">
              <SocialColumn />
            </div>
          </details>
        </div>

        <div className="site-footer__desktop-cols">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="site-footer__group-title">{group.title}</h3>
              <FooterLinkList links={group.links} />
            </div>
          ))}
          <div>
            <h3 className="site-footer__group-title">تابعنا</h3>
            <div className="mt-4">
              <SocialColumn />
            </div>
          </div>
        </div>
      </nav>

      <div className="site-footer__bottom">
        <div className="app-container">
          <div className="site-footer__brand-row">
            <BrandLogo href="/" showTagline={false} size="md" />
            <LanguageSwitch className="!mt-0" variant="compact" />
            <p className="site-footer__copy">{BRAND.copyright}</p>
          </div>
          <div className="site-footer__credit">
            <p className="site-footer__credit-ar">تم التطوير بواسطة {DEVELOPER.nameAr}</p>
            <p className="site-footer__credit-en" dir="ltr">
              Developed by{" "}
              <a
                className="focus-ring site-footer__credit-link"
                href={DEVELOPER.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {DEVELOPER.nameEn}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
    </LocalizedTree>
  );
}
