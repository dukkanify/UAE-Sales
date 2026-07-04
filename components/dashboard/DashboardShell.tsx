"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { Card } from "@/components/ui/Card";
import {
  clearSessionUser,
  getSessionUser,
} from "@/services/clientStorage";

type DashboardShellProps = {
  activePath: "/profile" | "/dashboard/listings";
  children: ReactNode;
  description: string;
  title: string;
  user: UserProfile;
};

const dashboardLinks = [
  { href: "/profile", label: "الملف الشخصي", icon: "👤" },
  { href: "/dashboard/listings", label: "إعلاناتي", icon: "📋" },
  { href: "/listings/new", label: "إضافة إعلان", icon: "➕" },
  { href: "/wallet", label: "المحفظة", icon: "💳" },
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
      <section className="app-container py-14">
        <Card className="overflow-hidden p-8 text-center">
          <div className="uae-flag-strip mx-auto mb-5 h-1.5 w-20 rounded-full" />
          <h1 className="text-2xl font-black text-ink">جاري التحقق من الجلسة</h1>
          <p className="mt-3 text-muted">
            سيتم توجيهك لتسجيل الدخول للوصول إلى هذه الصفحة.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container py-8 lg:py-14">
      <div className="mb-6 overflow-x-auto pb-1 lg:hidden">
        <div className="flex min-w-max gap-2">
          {dashboardLinks.map((link) => {
            const isActive = link.href === activePath;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted"
                }`}
              >
                <span aria-hidden>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-28 overflow-hidden p-5">
            <div className="uae-flag-strip -mx-5 -mt-5 mb-5 h-1.5" />
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-black text-white shadow-sm">
                {displayUser.fullName.slice(0, 2)}
              </div>
              <div>
                <p className="font-black text-ink">{displayUser.fullName}</p>
                <p className="mt-1 text-xs font-bold text-muted">
                  {displayUser.isVerified ? "حساب موثق ✓" : "بانتظار التوثيق"}
                </p>
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {dashboardLinks.map((link) => {
                const isActive = link.href === activePath;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-muted hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    <span aria-hidden>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
              <button
                className="mt-1 rounded-2xl border border-border bg-white px-4 py-3 text-right text-sm font-black text-primary transition hover:border-secondary hover:bg-secondary-soft"
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
        </aside>

        <div>
          <div className="mb-6 overflow-hidden rounded-[var(--radius-xl)] border border-secondary/20 bg-[linear-gradient(135deg,#fff8ed,#fffdf8)] p-6 shadow-[var(--shadow-soft)]">
            <div className="uae-flag-strip mb-4 h-1.5 w-24 rounded-full" />
            <p className="text-sm font-bold text-secondary">منطقة المستخدم</p>
            <h1 className="mt-2 text-3xl font-black text-ink md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl leading-8 text-muted">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
