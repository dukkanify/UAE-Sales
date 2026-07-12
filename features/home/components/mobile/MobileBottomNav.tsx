"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/shared/ui/Icon";

const items = [
  { href: "/", label: "الرئيسية", icon: "home" as const },
  { href: "/profile", label: "المفضلة", icon: "heart" as const },
  { href: "/listings/new", label: "أضف إعلان", icon: "plus" as const, fab: true },
  { href: "/chat", label: "الرسائل", icon: "message" as const, badge: 2 },
  { href: "/profile", label: "الحساب", icon: "user" as const, account: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل السفلي"
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-surface/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-5 items-end px-2 pb-1">
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
              <div key={item.href} className="flex justify-center">
                <Link
                  aria-label={item.label}
                  className="mobile-bottom-nav__fab -mt-5 grid size-14 place-items-center rounded-full text-primary shadow-[var(--shadow-glow)] transition active:scale-95"
                  href={item.href}
                >
                  <Icon name={item.icon} size={24} />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={`${item.href}-${item.label}`}
              className={`relative flex flex-col items-center gap-1 px-1 py-2 text-[0.65rem] font-bold transition ${
                isActive ? "text-secondary" : "text-muted"
              }`}
              href={item.href}
            >
              <span className="relative">
                <Icon filled={item.icon === "heart" && isActive} name={item.icon} size={20} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -start-2 grid min-w-[1rem] place-items-center rounded-full bg-error px-1 text-[0.55rem] font-black text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
