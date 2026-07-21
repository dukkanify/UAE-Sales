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
  icon: "chart" | "package" | "shield" | "wallet" | "briefcase" | "home" | "wrench";
  label: string;
}[] = [
  { href: "/admin", icon: "chart", label: "غرفة العمليات" },
  { href: "/admin/orders", icon: "package", label: "الطلبات" },
  { href: "/admin/escrow", icon: "shield", label: "الضمان" },
  { href: "/admin/reports", icon: "wallet", label: "التقارير" },
  { href: "/admin/job-applications", icon: "briefcase", label: "التوظيف" },
  { href: "/admin/viewing-bookings", icon: "home", label: "المعاينات" },
  { href: "/admin/quote-requests", icon: "wrench", label: "عروض الأسعار" },
];

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
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        setAuthState("guest");
        setDisplayUser(null);
        return;
      }
      setDisplayUser(sessionUser);
      setAuthState(sessionUser.role === "admin" ? "admin" : "user");
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    if (authState !== "guest") return;
    router.replace(`/login?next=${encodeURIComponent(activePath)}`);
  }, [authState, activePath, router]);

  async function handleLogout() {
    clearSessionUser();
    await removeSessionCookie();
    router.push("/login");
  }

  if (authState === "loading" || authState === "guest") {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من صلاحية الأدمن...</p>
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
            {adminLinks.map((link) => {
              const active = link.href === activePath;
              return (
                <Link
                  key={link.href}
                  className={`admin-ops__nav-link${active ? " admin-ops__nav-link--active" : ""}`}
                  href={link.href}
                >
                  <Icon name={link.icon} size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
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
