"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { UserProfile } from "@/types";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/services/clientStorage";

type DashboardShellProps = {
  activePath: "/profile" | "/dashboard/listings";
  children: ReactNode;
  description: string;
  title: string;
  user: UserProfile;
};

const dashboardLinks = [
  { href: "/profile", label: "الملف الشخصي" },
  { href: "/dashboard/listings", label: "إعلاناتي" },
  { href: "/listings/new", label: "إضافة إعلان" },
  { href: "/wallet", label: "المحفظة" },
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
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setDisplayUser(sessionUser);
      setIsAllowed(true);
      return;
    }

    router.replace(`/login?next=${activePath}`);
  }, [activePath, router, user]);

  if (!isAllowed) {
    return (
      <section className="app-container py-14">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-black text-ink">جاري التحقق من الجلسة</h1>
          <p className="mt-3 text-muted">
            سيتم توجيهك لتسجيل الدخول للوصول إلى هذه الصفحة.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container grid gap-6 py-10 lg:grid-cols-[18rem_1fr] lg:py-14">
      <aside>
        <Card className="sticky top-28 p-5">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-lg font-black text-primary">
              {displayUser.fullName.slice(0, 2)}
            </div>
            <div>
              <p className="font-black text-ink">{displayUser.fullName}</p>
              <p className="mt-1 text-xs font-bold text-muted">
                {displayUser.isVerified ? "حساب موثق" : "بانتظار التوثيق"}
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
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </Card>
      </aside>

      <div>
        <div className="mb-6">
          <p className="text-sm font-bold text-primary">منطقة المستخدم</p>
          <h1 className="mt-2 text-3xl font-black text-ink md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl leading-8 text-muted">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
