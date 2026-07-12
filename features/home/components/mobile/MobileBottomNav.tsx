"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";

const items = [
  { href: "/", icon: "home" as const, label: "الرئيسية" },
  { href: "/profile", icon: "heart" as const, label: "المفضلة" },
  { fab: true, href: "/listings/new", icon: "plus" as const, label: "أضف إعلان" },
  { badge: 2, href: "/chat", icon: "message" as const, label: "الرسائل" },
  { account: true, href: "/profile", icon: "user" as const, label: "الحساب" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="التنقل السفلي" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="mobile-bottom-nav__grid">
        {items.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.account
                ? pathname === "/profile" || pathname.startsWith("/profile/")
                : item.icon === "heart"
                  ? false
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.fab) {
            return (
              <div key={item.label} className="mobile-bottom-nav__fab-slot">
                <Link aria-label={item.label} className="mobile-bottom-nav__fab" href={item.href}>
                  <Icon name={item.icon} size={22} />
                </Link>
                <span className="mobile-bottom-nav__fab-label">{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              className={`mobile-bottom-nav__link ${
                isActive ? "mobile-bottom-nav__link--active" : ""
              }`}
              href={item.href}
            >
              <span className="mobile-bottom-nav__icon-wrap">
                <Icon filled={item.icon === "heart" && isActive} name={item.icon} size={20} />
                {item.badge ? (
                  <span className="mobile-bottom-nav__badge">{item.badge}</span>
                ) : null}
              </span>
              <span className="mobile-bottom-nav__label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
