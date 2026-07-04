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
  { href: "/profile", icon: "👤", label: "الملف الشخصي" },
  { href: "/dashboard/listings", icon: "📋", label: "إعلاناتي" },
  { href: "/listings/new", icon: "➕", label: "إضافة إعلان" },
  { href: "/wallet", icon: "💳", label: "المحفظة" },
  { href: "/chat", icon: "💬", label: "الرسائل" },
] as const;

const notifications = [
  { id: "1", text: "إعلانك الجديد قيد المراجعة", time: "منذ ساعة" },
  { id: "2", text: "تم استلام عرض شراء جديد", time: "منذ 3 ساعات" },
  { id: "3", text: "رصيدك جاهز للسحب", time: "أمس" },
];

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
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-black text-ink">جاري التحقق من الجلسة</h1>
          <p className="mt-3 text-muted">سيتم توجيهك لتسجيل الدخول.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container py-8 lg:py-12">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {dashboardLinks.map((link) => (
          <Link
            key={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              link.href === activePath
                ? "bg-primary text-white"
                : "border border-border bg-surface text-muted"
            }`}
            href={link.href}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:grid lg:gap-4 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-primary text-sm font-black text-white">
                {displayUser.fullName.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-black text-ink">{displayUser.fullName}</p>
                <p className="text-xs font-medium text-muted">
                  {displayUser.isVerified ? "موثق ✓" : "بانتظار التوثيق"}
                </p>
              </div>
            </div>

            <nav className="mt-5 grid gap-1">
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    link.href === activePath
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface-muted hover:text-ink"
                  }`}
                  href={link.href}
                >
                  <span aria-hidden>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <button
                className="mt-2 rounded-xl border border-border px-3.5 py-2.5 text-right text-sm font-bold text-muted transition hover:bg-surface-muted hover:text-ink"
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

          <Card className="p-5">
            <p className="text-xs font-bold text-muted">رصيد المحفظة</p>
            <p className="mt-2 text-2xl font-black text-ink">
              2,450 <span className="text-sm font-bold text-muted">د.إ</span>
            </p>
            <Link
              className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-xl bg-secondary-soft text-sm font-bold text-primary transition hover:bg-secondary"
              href="/wallet"
            >
              إدارة المحفظة
            </Link>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold text-muted">الإشعارات</p>
            <div className="mt-3 grid gap-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-surface-muted p-3 text-xs"
                >
                  <p className="font-bold text-ink">{item.text}</p>
                  <p className="mt-1 font-medium text-muted">{item.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <div>
          <div className="mb-8">
            <p className="text-sm font-bold text-secondary">لوحة التحكم</p>
            <h1 className="mt-1 text-3xl font-black text-ink md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-muted">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
