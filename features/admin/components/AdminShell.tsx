"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { AdminUnauthorized } from "@/features/admin/components/AdminUnauthorized";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { PageHero } from "@/shared/ui/PageHero";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";

export type AdminPath =
  | "/admin"
  | "/admin/users"
  | "/admin/listings"
  | "/admin/orders"
  | "/admin/escrow"
  | "/admin/disputes"
  | "/admin/categories"
  | "/admin/reports"
  | "/admin/settings";

type AdminShellProps = {
  activePath: AdminPath;
  children: ReactNode;
  description: string;
  title: string;
};

const adminLinks: { href: AdminPath; icon: "chart" | "user" | "grid" | "package" | "shield" | "message" | "briefcase" | "edit"; label: string }[] = [
  { href: "/admin", icon: "chart", label: "لوحة الإدارة" },
  { href: "/admin/users", icon: "user", label: "المستخدمون" },
  { href: "/admin/listings", icon: "grid", label: "الإعلانات" },
  { href: "/admin/orders", icon: "package", label: "الطلبات" },
  { href: "/admin/escrow", icon: "shield", label: "الضمان" },
  { href: "/admin/disputes", icon: "message", label: "النزاعات" },
  { href: "/admin/categories", icon: "briefcase", label: "التصنيفات" },
  { href: "/admin/reports", icon: "chart", label: "التقارير" },
  { href: "/admin/settings", icon: "edit", label: "الإعدادات" },
];

export function AdminShell(props: AdminShellProps) {
  return (
    <Suspense
      fallback={
        <section className="app-container page-padding">
          <Card className="p-8 text-center" variant="flat">
            <p className="text-sm font-medium text-muted">جاري التحميل...</p>
          </Card>
        </section>
      }
    >
      <AdminShellInner {...props} />
    </Suspense>
  );
}

function AdminShellInner({
  activePath,
  children,
  description,
  title,
}: AdminShellProps) {
  const [authState, setAuthState] = useState<"loading" | "guest" | "user" | "admin">("loading");
  const [displayUser, setDisplayUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (!sessionUser) {
        setAuthState("guest");
        const query = searchParams.toString();
        const returnPath = query ? `${pathname}?${query}` : pathname;
        router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }

      setDisplayUser(sessionUser);
      setAuthState(sessionUser.role === "admin" ? "admin" : "user");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchParams]);

  if (authState === "loading" || authState === "guest") {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من الصلاحيات...</p>
        </Card>
      </section>
    );
  }

  if (authState === "user") {
    return <AdminUnauthorized />;
  }

  return (
    <section className="app-container page-padding">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-xl)] px-3.5 py-2 text-sm font-medium transition ${
              link.href === activePath
                ? "bg-primary text-white"
                : "border border-border bg-surface text-muted"
            }`}
            href={link.href}
          >
            <Icon name={link.icon} size={14} />
            {link.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:grid lg:gap-4 lg:self-start">
          <Card className="admin-sidebar p-5" variant="flat">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-secondary text-xs font-semibold text-primary">
                AD
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {displayUser?.fullName}
                </p>
                <p className="text-xs font-medium text-muted">مدير النظام</p>
              </div>
            </div>
            <nav className="mt-5 grid gap-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  className={`flex items-center gap-2.5 rounded-[var(--radius-xl)] px-3 py-2.5 text-sm font-medium transition ${
                    link.href === activePath
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface-muted hover:text-ink"
                  }`}
                  href={link.href}
                >
                  <Icon name={link.icon} size={16} />
                  {link.label}
                </Link>
              ))}
              <button
                className="mt-2 rounded-[var(--radius-xl)] px-3 py-2.5 text-right text-sm font-medium text-muted transition hover:bg-surface-muted"
                onClick={() => {
                  clearSessionUser();
                  router.replace("/login");
                }}
                type="button"
              >
                تسجيل الخروج
              </button>
            </nav>
          </Card>

          <Card className="marketplace-panel p-5" variant="flat">
            <p className="text-xs font-medium text-muted">عودة للمنصة</p>
            <Button className="mt-3 w-full" href="/" size="sm" variant="secondary">
              الموقع الرئيسي
            </Button>
          </Card>
        </aside>

        <div>
          <PageHero description={description} eyebrow="لوحة الإدارة" title={title} />
          {children}
        </div>
      </div>
    </section>
  );
}
