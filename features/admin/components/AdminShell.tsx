"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { BRAND } from "@/shared/constants/brand";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import { removeSessionCookie } from "@/services/auth/session-sync";
import "./admin-ops.css";

export type AdminPath =
  | "/admin"
  | "/admin/analytics"
  | "/admin/reports"
  | "/admin/users"
  | "/admin/listings"
  | "/admin/disputes"
  | "/admin/categories"
  | "/admin/orders"
  | "/admin/escrow"
  | "/admin/wallets"
  | "/admin/stripe"
  | "/admin/job-applications"
  | "/admin/viewing-bookings"
  | "/admin/quote-requests"
  | "/admin/settings";

type AdminShellProps = {
  activePath: AdminPath;
  children: ReactNode;
  description: string;
  title: string;
};

type NavGroup = "ops" | "insight" | "moderation" | "money" | "leads" | "system";

const adminLinks: {
  href: AdminPath;
  icon: IconName;
  label: string;
  group: NavGroup;
  keywords: string;
}[] = [
  {
    href: "/admin",
    icon: "home",
    label: "غرفة التحكم",
    group: "ops",
    keywords: "لوحة رئيسية dashboard",
  },
  {
    href: "/admin/analytics",
    icon: "chart",
    label: "التحليلات",
    group: "insight",
    keywords: "إحصائيات charts trends",
  },
  {
    href: "/admin/reports",
    icon: "wallet",
    label: "التقارير",
    group: "insight",
    keywords: "مالية fees volume",
  },
  {
    href: "/admin/users",
    icon: "user",
    label: "المستخدمون",
    group: "moderation",
    keywords: "حسابات تعليق تحقق",
  },
  {
    href: "/admin/listings",
    icon: "grid",
    label: "الإعلانات",
    group: "moderation",
    keywords: "مراجعة اعتماد",
  },
  {
    href: "/admin/disputes",
    icon: "message",
    label: "النزاعات",
    group: "moderation",
    keywords: "خلاف حكم",
  },
  {
    href: "/admin/categories",
    icon: "briefcase",
    label: "التصنيفات",
    group: "moderation",
    keywords: "فئات",
  },
  {
    href: "/admin/orders",
    icon: "package",
    label: "الطلبات",
    group: "money",
    keywords: "استرداد checkout",
  },
  {
    href: "/admin/escrow",
    icon: "shield",
    label: "الضمان",
    group: "money",
    keywords: "حجز escrow",
  },
  {
    href: "/admin/wallets",
    icon: "wallet",
    label: "المحافظ",
    group: "money",
    keywords: "أرصدة",
  },
  {
    href: "/admin/stripe",
    icon: "star",
    label: "Stripe",
    group: "money",
    keywords: "دفع بوابة webhook payments",
  },
  {
    href: "/admin/job-applications",
    icon: "briefcase",
    label: "التوظيف",
    group: "leads",
    keywords: "وظائف",
  },
  {
    href: "/admin/viewing-bookings",
    icon: "home",
    label: "المعاينات",
    group: "leads",
    keywords: "عقارات",
  },
  {
    href: "/admin/quote-requests",
    icon: "wrench",
    label: "عروض الأسعار",
    group: "leads",
    keywords: "خدمات",
  },
  {
    href: "/admin/settings",
    icon: "filter",
    label: "إعدادات الموقع",
    group: "system",
    keywords: "رسوم صيانة stripe url",
  },
];

const groupOrder: NavGroup[] = [
  "ops",
  "insight",
  "moderation",
  "money",
  "leads",
  "system",
];

const groupLabels: Record<NavGroup, string> = {
  ops: "القيادة",
  insight: "تقارير وتحليلات",
  moderation: "الإشراف",
  money: "المال والمدفوعات",
  leads: "الوارد",
  system: "النظام",
};

export function AdminShell({
  activePath,
  children,
  description,
  title,
}: AdminShellProps) {
  const [authState, setAuthState] = useState<"loading" | "guest" | "user" | "admin">(
    "loading",
  );
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (!sessionUser || sessionUser.role !== "admin") {
      router.replace(`/login?next=${encodeURIComponent(activePath)}`);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setDisplayUser(sessionUser);
      setAuthState("admin");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, activePath, router]);

  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminLinks;
    return adminLinks.filter(
      (link) =>
        link.label.includes(query.trim()) ||
        link.keywords.toLowerCase().includes(q) ||
        link.href.includes(q),
    );
  }, [query]);

  async function handleLogout() {
    clearSessionUser();
    await removeSessionCookie();
    router.push("/login?next=/admin");
  }

  if (authState !== "admin") {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري توجيهك لتسجيل الدخول...</p>
        </Card>
      </section>
    );
  }

  return (
    <div className="admin-ops">
      <div className="admin-ops__aura" aria-hidden />
      <header className="admin-ops__topbar">
        <div className="admin-ops__brand">
          <Image
            alt={BRAND.nameAr}
            className="admin-ops__mark"
            height={40}
            priority
            src="/brand/logo-icon.svg"
            unoptimized
            width={40}
          />
          <div>
            <p className="admin-ops__brand-name">{BRAND.nameAr} Control</p>
            <p className="admin-ops__brand-sub">لوحة تحكم كاملة للموقع</p>
          </div>
        </div>
        <div className="admin-ops__top-actions">
          <div className="admin-ops__who">
            <p className="admin-ops__who-name">{displayUser?.fullName ?? "Admin"}</p>
            <p className="admin-ops__who-role">مدير النظام</p>
          </div>
          <Button onClick={handleLogout} size="sm" type="button" variant="secondary">
            خروج
          </Button>
        </div>
      </header>

      <div className="admin-ops__layout">
        <aside className="admin-ops__sidebar" aria-label="تنقل الإدارة">
          <label className="admin-ops__search">
            <Icon name="search" size={14} />
            <input
              aria-label="بحث في أقسام اللوحة"
              placeholder="بحث سريع في الأقسام..."
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <nav className="admin-ops__nav">
            {groupOrder.map((group) => {
              const links = filteredLinks.filter((link) => link.group === group);
              if (links.length === 0) return null;
              return (
                <div key={group} className="admin-ops__nav-group">
                  <p className="admin-ops__nav-group-label">{groupLabels[group]}</p>
                  {links.map((link) => {
                    const active = link.href === activePath;
                    return (
                      <Link
                        key={link.href}
                        className={`admin-ops__nav-link${
                          active ? " admin-ops__nav-link--active" : ""
                        }`}
                        href={link.href}
                      >
                        <Icon name={link.icon} size={16} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="admin-ops__sidebar-footer">
            <a
              className="admin-ops__back"
              href="https://dashboard.stripe.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard ↗
            </a>
            <Link className="admin-ops__back" href="/">
              ← العودة لسوقنا
            </Link>
          </div>
        </aside>

        <div className="admin-ops__main">
          <div className="admin-ops__mobile-nav" aria-label="تنقل سريع">
            {adminLinks.map((link) => {
              const active = link.href === activePath;
              return (
                <Link
                  key={link.href}
                  className={`admin-ops__pill${active ? " admin-ops__pill--active" : ""}`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="admin-ops__hero">
            <p className="admin-ops__eyebrow">لوحة التحكم الكاملة</p>
            <h1 className="admin-ops__title">{title}</h1>
            <p className="admin-ops__desc">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
