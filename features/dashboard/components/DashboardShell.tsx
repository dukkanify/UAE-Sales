"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { PageHero } from "@/shared/ui/PageHero";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";

type DashboardShellProps = {
  activePath: "/profile" | "/dashboard/listings" | "/chat";
  children: ReactNode;
  description: string;
  title: string;
  user: UserProfile;
};

const dashboardLinks = [
  { href: "/profile", icon: "user" as const, label: "الملف الشخصي" },
  { href: "/dashboard/listings", icon: "grid" as const, label: "إعلاناتي" },
  { href: "/listings/new", icon: "plus" as const, label: "إضافة إعلان" },
  { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
  { href: "/chat", icon: "message" as const, label: "الرسائل" },
] as const;

export function DashboardShell({
  activePath,
  children,
  description,
  title,
  user,
}: DashboardShellProps) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        setDisplayUser(sessionUser);
        setIsAllowed(true);
        return;
      }
      router.replace(`/login?next=${activePath}`);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activePath, router, user]);

  if (!isAllowed) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من الجلسة...</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container page-padding">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {dashboardLinks.map((link) => (
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
          <Card className="p-5" variant="flat">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-primary text-xs font-semibold text-white">
                {displayUser.fullName.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {displayUser.fullName}
                </p>
                <p className="text-xs font-medium text-muted">
                  {displayUser.isVerified ? "موثق" : "بانتظار التوثيق"}
                </p>
              </div>
            </div>
            <nav className="mt-5 grid gap-1">
              {dashboardLinks.map((link) => (
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

          <Card className="p-5" variant="flat">
            <p className="text-xs font-medium text-muted">رصيد المحفظة</p>
            <p className="mt-1 text-xl font-semibold text-ink">
              2,450 <span className="text-xs font-medium text-muted">د.إ</span>
            </p>
            <p className="mt-1 text-xs font-medium text-muted">
              850 د.إ قيد المعالجة
            </p>
            <Button className="mt-4 w-full" href="/wallet" size="sm" variant="secondary">
              إدارة المحفظة
            </Button>
          </Card>
        </aside>

        <div>
          <PageHero description={description} eyebrow="لوحة التحكم" title={title} />
          {children}
        </div>
      </div>
    </section>
  );
}
