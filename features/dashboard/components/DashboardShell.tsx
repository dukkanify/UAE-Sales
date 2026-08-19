"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { WalletBalanceCard } from "@/features/wallet/components/WalletBalanceCard";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { PageHero } from "@/shared/ui/PageHero";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/storage";
import { removeSessionCookie } from "@/services/auth/session-sync";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

type DashboardShellProps = {
  activePath?: string;
  children: ReactNode;
  description: string;
  title: string;
  user: UserProfile;
};

const dashboardLinks = [
  { href: "/profile", icon: "user" as const, label: "الملف الشخصي" },
  { href: "/orders", icon: "package" as const, label: "طلباتي" },
  { href: "/dashboard/listings", icon: "grid" as const, label: "إعلاناتي" },
  { href: "/listings/new", icon: "plus" as const, label: "إضافة إعلان" },
  { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان" },
  { href: "/chat", icon: "message" as const, label: "الرسائل" },
] as const;

function isDashboardLinkActive(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile";
  if (href === "/listings/new") return pathname.startsWith("/listings/new");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function accountInitials(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part && !/^sooqna$/i.test(part) && part !== "سوقنا");
  if (parts.length === 0) return "ح";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function DashboardShell({
  activePath,
  children,
  description,
  title,
  user,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const router = useRouter();
  const loginNext = activePath || pathname || "/profile";
  const onWalletPage = pathname === "/wallet" || pathname.startsWith("/wallet/");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        setDisplayUser(sessionUser);
        setIsAllowed(true);
        return;
      }
      router.replace(`/login?next=${loginNext}`);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loginNext, router, user]);

  if (!isAllowed) {
    return (
      <LocalizedTree>
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من الجلسة...</p>
        </Card>
      </section>
      </LocalizedTree>
    );
  }

  return (
    <LocalizedTree>
    <section className="app-container page-padding">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {dashboardLinks.map((link) => (
          <Link
            key={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-xl)] px-3.5 py-2 text-sm font-medium transition ${
              isDashboardLinkActive(pathname, link.href)
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
                {accountInitials(displayUser.fullName)}
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
                    isDashboardLinkActive(pathname, link.href)
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
                className="mt-2 rounded-[var(--radius-xl)] px-3 py-2.5 text-start text-sm font-medium text-muted transition hover:bg-surface-muted"
                onClick={() => {
                  clearSessionUser();
                  void removeSessionCookie();
                  router.replace("/login");
                }}
                type="button"
              >
                تسجيل الخروج
              </button>
            </nav>
          </Card>

          {onWalletPage ? null : <WalletBalanceCard />}
        </aside>

        <div>
          <PageHero description={description} eyebrow="لوحة التحكم" title={title} />
          {children}
        </div>
      </div>
    </section>
    </LocalizedTree>
  );
}
