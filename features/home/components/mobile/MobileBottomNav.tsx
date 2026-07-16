"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/Icon";

const items = [
  { href: "/", icon: "home" as const, label: "الرئيسية" },
  {
    favorites: true,
    href: "/profile#favorites",
    icon: "heart" as const,
    label: "المفضلة",
  },
  { fab: true, href: "/listings/new", icon: "plus" as const, label: "أضف إعلان" },
  { badge: 2, href: "/chat", icon: "message" as const, label: "الرسائل" },
  { account: true, href: "/profile", icon: "user" as const, label: "الحساب" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  return (
    <nav aria-label="التنقل السفلي" className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="mobile-bottom-nav__inner">
        <div className="mobile-bottom-nav__grid">
        {items.map((item) => {
          const isFavorites = "favorites" in item && item.favorites;
          const isAccount = "account" in item && item.account;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : isFavorites
                ? pathname === "/profile" && hash === "#favorites"
                : isAccount
                  ? pathname === "/profile" && hash !== "#favorites"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if ("fab" in item && item.fab) {
            return (
              <div key={item.label} className="mobile-bottom-nav__fab-slot">
                <Link aria-label={item.label} className="mobile-bottom-nav__fab" href={item.href}>
                  <Icon name={item.icon} size={20} />
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
              <span
                className={`mobile-bottom-nav__icon-wrap${
                  isActive ? " mobile-bottom-nav__icon-wrap--active" : ""
                }`}
              >
                <Icon
                  filled={item.icon === "heart" && isActive}
                  name={item.icon}
                  size={item.icon === "heart" ? 21 : 20}
                />
                {"badge" in item && item.badge ? (
                  <span className="mobile-bottom-nav__badge">{item.badge}</span>
                ) : null}
              </span>
              <span className="mobile-bottom-nav__label">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
