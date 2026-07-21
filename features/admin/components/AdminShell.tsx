"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { AdminUnauthorized } from "@/features/admin/components/AdminUnauthorized";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import { removeSessionCookie } from "@/services/auth/session-sync";
import "./admin-ops.css";

export type AdminPath =
  | "/admin"
  | "/admin/users"
  | "/admin/listings"
  | "/admin/disputes"
  | "/admin/categories"
  | "/admin/orders"
  | "/admin/escrow"
  | "/admin/reports"
  | "/admin/job-applications"
  | "/admin/viewing-bookings"
  | "/admin/quote-requests";

type AdminShellProps = {
  activePath: AdminPath;
  children: ReactNode;
  description: string;
  title: string;
};

const adminLinks: {
  href: AdminPath;
  icon:
    | "chart"
    | "user"
    | "grid"
    | "message"
    | "briefcase"
    | "package"
    | "shield"
    | "wallet"
    | "home"
    | "wrench";
  label: string;
  group: "ops" | "moderation" | "money" | "leads";
}[] = [
  { href: "/admin", icon: "chart", label: "غرفة العمليات", group: "ops" },
  { href: "/admin/users", icon: "user", label: "المستخدمون", group: "moderation" },
  { href: "/admin/listings", icon: "grid", label: "الإعلانات", group: "moderation" },
  { href: "/admin/disputes", icon: "message", label: "النزاعات", group: "moderation" },
  { href: "/admin/categories", icon: "briefcase", label: "التصنيفات", group: "moderation" },
  { href: "/admin/orders", icon: "package", label: "الطلبات", group: "money" },
  { href: "/admin/escrow", icon: "shield", label: "الضمان", group: "money" },
  { href: "/admin/reports", icon: "wallet", label: "التقارير", group: "money" },
  { href: "/admin/job-applications", icon: "briefcase", label: "التوظيف", group: "leads" },
  { href: "/admin/viewing-bookings", icon: "home", label: "المعاينات", group: "leads" },
  { href: "/admin/quote-requests", icon: "wrench", label: "عروض الأسعار", group: "leads" },
];

const groupLabels: Record<(typeof adminLinks)[number]["group"], string> = {
  ops: "القيادة",
  moderation: "الإشراف",
  money: "المال",
  leads: "الوارد",
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (!sessionUser) {
      // Immediate client redirect if cookie gate somehow skipped (localStorage-only session).
      router.replace(`/login?next=${encodeURIComponent(activePath)}`);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setDisplayUser(sessionUser);
      setAuthState(sessionUser.role === "admin" ? "admin" : "user");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname, activePath, router]);

  async function handleLogout() {
    clearSessionUser();
    await removeSessionCookie();
    router.push("/login?next=/admin");
  }

  if (authState === "loading") {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري توجيهك لتسجيل الدخول...</p>
        </Card>
      </section>
    );
  }

  if (authState === "user") {
    return <AdminUnauthorized />;
  }

  return (
    <div className="admin-ops">
      <div className="admin-ops__aura" aria-hidden />
      <header className="admin-ops__topbar">
        <div className="admin-ops__brand">
          <span className="admin-ops__mark">س</span>
          <div>
            <p className="admin-ops__brand-name">Sooqna Control</p>
            <p className="admin-ops__brand-sub">لوحة تشغيل السوق</p>
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
          <nav className="admin-ops__nav">
            {(["ops", "moderation", "money", "leads"] as const).map((group) => (
              <div key={group} className="admin-ops__nav-group">
                <p className="admin-ops__nav-group-label">{groupLabels[group]}</p>
                {adminLinks
                  .filter((link) => link.group === group)
                  .map((link) => {
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
            ))}
          </nav>
          <Link className="admin-ops__back" href="/">
            ← العودة لسوقنا
          </Link>
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
            <p className="admin-ops__eyebrow">الإدارة</p>
            <h1 className="admin-ops__title">{title}</h1>
            <p className="admin-ops__desc">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
